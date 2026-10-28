import os
import re
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User

from knowledge.models import KnowledgeArticle
from customers.models import Customer
from appointments.models import Appointment
from appointments.services import AppointmentService
from tickets.models import SupportTicket

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Language & Safety Detection Utilities
# ---------------------------------------------------------------------------

HINGLISH_KEYWORDS = {
    'mujhe', 'karna', 'chahiye', 'kal', 'aaj', 'subah', 'shaam',
    'baje', 'haan', 'ha', 'nahi', 'theek', 'kripya', 'batao', 'shukriya',
    'namaste', 'dhanyawad', 'dard', 'khoon',
    'saans', 'madad', 'batayein', 'kijiye', 'karo', 'hai', 'kaise', 'kab',
    'kaha'
}

EMERGENCY_KEYWORDS_EN = [
    'chest pain', 'heart attack', 'cannot breathe', "can't breathe",
    'shortness of breath', 'severe bleeding', 'unconscious', 'stroke',
    'seizure', 'choking', 'poison', 'overdose', 'suicide'
]

EMERGENCY_KEYWORDS_HI = [
    'सीने में दर्द', 'सांस नहीं आ रही', 'बेहोश', 'दिल का दौरा', 'बहुत खून बह रहा'
]

EMERGENCY_KEYWORDS_HINGLISH = [
    'seene me dard', 'sine me dard', 'chhati me dard', 'chhati me pain',
    'saans lene me takleef', 'saans phool rahi', 'bahut khoon', 'behoosh', 'dil ka daura'
]


def detect_language(text, current_lang='en'):
    """
    Detects whether the input is in English ('en'), Hindi ('hi'), or Hinglish ('hinglish').
    """
    clean = (text or '').strip()
    if not clean:
        return current_lang

    # Hindi: contains Devanagari script (U+0900 to U+097F)
    if re.search(r'[\u0900-\u097F]', clean):
        return 'hi'

    # Hinglish: contains Roman alphabet with common Hindi words
    words = set(re.findall(r'[a-zA-Z]+', clean.lower()))
    if words.intersection(HINGLISH_KEYWORDS):
        return 'hinglish'

    return current_lang or 'en'


def check_medical_emergency(text):
    """
    Detects life-threatening symptoms and generates an immediate emergency protocol response.
    """
    clean = (text or '').lower()
    
    # Check English
    if any(k in clean for k in EMERGENCY_KEYWORDS_EN):
        return True, 'en'
    # Check Hindi (raw text for script)
    if any(k in text for k in EMERGENCY_KEYWORDS_HI):
        return True, 'hi'
    # Check Hinglish
    if any(k in clean for k in EMERGENCY_KEYWORDS_HINGLISH):
        return True, 'hinglish'

    return False, None


def get_emergency_response(lang='en'):
    if lang == 'hi':
        return (
            "🚨 आपातकालीन चेतावनी (EMERGENCY ALERT):\n"
            "यह एक गंभीर चिकित्सीय आपातकाल हो सकता है। कृपया ऑनलाइन चैट या अपॉइंटमेंट की प्रतीक्षा न करें।\n"
            "तुरंत आपातकालीन हेल्पलाइन 112 / 102 पर कॉल करें या नजदीकी अस्पताल के इमरजेंसी वार्ड में जाएं।"
        )
    elif lang == 'hinglish':
        return (
            "🚨 EMERGENCY ALERT:\n"
            "Yeh ek serious medical emergency ho sakti hai. Kripya online chat ya appointment ka intezar na karein.\n"
            "Turant Emergency Helpline 112 / 102 par call karein ya apne paas ke hospital emergency room jayein."
        )
    else:
        return (
            "🚨 EMERGENCY MEDICAL ALERT:\n"
            "Your symptoms indicate a potentially life-threatening medical emergency. "
            "Do not wait for an online consultation or standard appointment. "
            "Please immediately call emergency services (112 / 102 / 911) or proceed directly to the nearest hospital emergency department."
        )


# ---------------------------------------------------------------------------
# Tool Registry
# ---------------------------------------------------------------------------

class ToolRegistry:
    """
    Server-side tool execution registry for OPERA AI clinic operations.
    """

    @staticmethod
    def search_knowledge_base(query):
        query_clean = (query or '').strip()
        query_filter = Q(title__icontains=query_clean) | Q(content__icontains=query_clean)

        stopwords = {'what', 'your', 'about', 'with', 'have', 'from', 'this', 'that', 'does', 'will', 'the', 'are'}
        tokens = [w for w in query_clean.replace('?', ' ').replace('.', ' ').split() if len(w) >= 3 and w.lower() not in stopwords]
        for token in tokens:
            query_filter |= Q(title__icontains=token) | Q(content__icontains=token)

        articles = KnowledgeArticle.objects.filter(status='published').filter(query_filter).distinct()[:3]
        return [
            {
                "id": a.id,
                "title": a.title,
                "category": a.category,
                "snippet": a.content[:350] + ("..." if len(a.content) > 350 else ""),
            }
            for a in articles
        ]

    @staticmethod
    def get_available_doctors():
        """Returns registered clinic medical doctors."""
        docs = User.objects.filter(is_staff=True).exclude(username__in=['admin', 'root'])
        res = []
        for d in docs:
            dept = d.profile.department if hasattr(d, 'profile') else 'General Medicine'
            res.append({
                "id": d.id,
                "username": d.username,
                "name": f"Dr. {d.first_name} {d.last_name}".strip() if d.first_name else f"Dr. {d.username}",
                "department": dept,
            })
        return res

    @staticmethod
    def match_doctor(text):
        """Matches a doctor from text by department or doctor name."""
        lower = text.lower()
        doctors = ToolRegistry.get_available_doctors()
        
        # Match by department
        if any(w in lower for w in ['derma', 'skin', 'chamdi', 'tvacha']):
            for d in doctors:
                if 'dermatology' in d['department'].lower():
                    return d
        if any(w in lower for w in ['cardio', 'heart', 'dil']):
            for d in doctors:
                if 'cardiology' in d['department'].lower():
                    return d
        if any(w in lower for w in ['general', 'physician', 'medicine', 'bukhar', 'fever', 'cold']):
            for d in doctors:
                if 'general' in d['department'].lower():
                    return d

        # Match by name
        for d in doctors:
            if d['username'].lower() in lower or (d['name'] and d['name'].lower() in lower):
                return d

        # Default to first doctor if available
        return doctors[0] if doctors else None

    @staticmethod
    def check_availability(staff_id=None, date_str=None):
        return AppointmentService.get_available_slots(staff_id=staff_id, date_str=date_str)

    @staticmethod
    def escalate_to_human(customer, reason, conversation=None):
        ticket = SupportTicket.objects.create(
            customer=customer,
            conversation=conversation,
            subject=f"Human Escalation: {reason[:60]}",
            description=reason,
            priority='urgent',
            category='escalation',
            is_escalated=True,
            escalation_reason=reason,
        )
        return {
            "escalated": True,
            "ticket_number": ticket.ticket_number,
            "message": "A clinic operations manager has been alerted.",
        }


# ---------------------------------------------------------------------------
# Gemini & Grounded Agent Service
# ---------------------------------------------------------------------------

class GeminiAgentService:
    """
    Dedicated AI Agent service for OPERA AI Clinic Operations:
    - Multilingual (English, Hindi, Hinglish)
    - Medical safety & emergency protocol
    - Multi-turn action state machine (Booking, Rescheduling, Cancellation)
    - Grounded clinic knowledge base retrieval
    - Real Gemini LLM API integration with robust fallback
    """

    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', '') or os.getenv('GEMINI_API_KEY', '')
        self.model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')

    def process_message(self, user_message, customer=None, conversation=None):
        user_text = (user_message or '').strip()
        tools_executed = []
        sources = []
        requires_escalation = False
        intent = "general_inquiry"
        sentiment = "neutral"

        # 1. Determine Language
        current_lang = conversation.language if conversation else 'en'
        lang = detect_language(user_text, current_lang=current_lang)

        # 2. Check for Medical Emergencies (Phase 13)
        is_emergency, emergency_lang = check_medical_emergency(user_text)
        if is_emergency:
            resp_lang = emergency_lang or lang
            return {
                "response": get_emergency_response(resp_lang),
                "intent": "medical_emergency",
                "sentiment": "negative",
                "sources": [],
                "tools_executed": [],
                "requires_escalation": True,
                "action_state": {},
                "language": resp_lang,
                "is_emergency": True,
            }

        # 3. Read & Maintain Action State (Phase 11)
        action_state = (conversation.action_state if conversation and conversation.action_state else {}).copy()
        lower_msg = user_text.lower()

        # 4. Human Escalation Intent Check (Phase 12)
        if any(w in lower_msg for w in ['human', 'manager', 'speak to someone', 'talk to person', 'agent', 'insaan', 'baat karni hai', 'frustrated']):
            requires_escalation = True
            intent = "human_escalation"
            sentiment = "negative"
            if customer:
                esc_res = ToolRegistry.escalate_to_human(customer, user_text, conversation=conversation)
                tools_executed.append({"tool": "escalate_to_human", "result": esc_res})
                ticket_num = esc_res["ticket_number"]
                if lang == 'hi':
                    resp = f"मैंने हमारे क्लिनिक ऑपरेशंस मैनेजर को सूचित कर दिया है। आपका सपोर्ट टिकट नंबर है: {ticket_num}। हमारे स्टाफ सदस्य जल्द ही आपसे संपर्क करेंगे।"
                elif lang == 'hinglish':
                    resp = f"Maine hamare clinic operations manager ko alert kar diya hai. Aapka support ticket number hai: {ticket_num}. Hamara staff jald hi aapse sampark karega."
                else:
                    resp = f"I have escalated your request to our clinic operations manager. Your support ticket number is {ticket_num}. A staff member will connect with you shortly."
                return {
                    "response": resp,
                    "intent": intent,
                    "sentiment": sentiment,
                    "sources": [],
                    "tools_executed": tools_executed,
                    "requires_escalation": True,
                    "action_state": {},
                    "language": lang,
                }

        # 5. Multi-Turn Action Handling
        # Awaiting Confirmation Step
        if action_state.get('status') == 'awaiting_confirmation':
            is_confirm = any(w in lower_msg for w in ['yes', 'confirm', 'haan', 'ha', 'sure', 'हाँ', 'theek hai', 'thik hai', 'book it', 'proceed', 'kar do'])
            is_deny = any(w in lower_msg for w in ['no', 'cancel', 'nahi', 'नहीं', 'mat karo', 'change', 'stop'])

            if is_confirm:
                action = action_state.get('action')
                if action == 'book_appointment':
                    try:
                        doc = User.objects.get(pk=action_state['doctor_id'])
                        start_time = datetime.fromisoformat(action_state['start_time'])
                        end_time = datetime.fromisoformat(action_state['end_time'])
                        
                        apt = AppointmentService.book_appointment(
                            customer=customer,
                            staff_member=doc,
                            start_time=start_time,
                            end_time=end_time,
                            title=f"Consultation with {doc.get_full_name() or doc.username}",
                            actor=getattr(customer, 'user', None),
                        )
                        tools_executed.append({
                            "tool": "book_appointment",
                            "appointment_id": apt.id,
                            "doctor": doc.username,
                            "time": start_time.isoformat(),
                        })
                        action_state = {'action': 'book_appointment', 'status': 'completed', 'appointment_id': apt.id}
                        
                        doc_name = doc.get_full_name() or f"Dr. {doc.username}"
                        date_display = start_time.strftime('%Y-%m-%d at %I:%M %p')
                        
                        if lang == 'hi':
                            resp = f"✅ आपका अपॉइंटमेंट सफलतापूर्वक बुक हो गया है!\n\nडॉक्टर: {doc_name}\nदिनांक व समय: {date_display}\nबुकिंग आईडी: #{apt.id}\n\nक्लिनिक का पता: 104 Medical Enclave, Health City."
                        elif lang == 'hinglish':
                            resp = f"✅ Aapka appointment successfully book ho gaya hai!\n\nDoctor: {doc_name}\nDate & Time: {date_display}\nBooking ID: #{apt.id}\n\nClinic address: 104 Medical Enclave, Health City."
                        else:
                            resp = f"✅ Your appointment has been successfully booked!\n\nDoctor: {doc_name}\nDate & Time: {date_display}\nBooking ID: #{apt.id}\nClinic Address: 104 Medical Enclave, Health City."
                        
                        return {
                            "response": resp,
                            "intent": "scheduling",
                            "sentiment": "positive",
                            "sources": [],
                            "tools_executed": tools_executed,
                            "requires_escalation": False,
                            "action_state": action_state,
                            "language": lang,
                        }
                    except Exception as e:
                        err_msg = str(e)
                        action_state['status'] = 'failed'
                        if lang == 'hi':
                            resp = f"क्षमा करें, बुकिंग के दौरान त्रुटि हुई: {err_msg}। कृपया पुनः प्रयास करें।"
                        elif lang == 'hinglish':
                            resp = f"Sorry, booking karte waqt error aaya: {err_msg}. Kripya dobara try karein."
                        else:
                            resp = f"Sorry, there was an issue completing the booking: {err_msg}. Please try selecting another slot."
                        return {
                            "response": resp,
                            "intent": "scheduling",
                            "sentiment": "negative",
                            "sources": [],
                            "tools_executed": tools_executed,
                            "requires_escalation": False,
                            "action_state": action_state,
                            "language": lang,
                        }

                elif action == 'reschedule_appointment':
                    try:
                        apt_id = action_state['appointment_id']
                        new_start = datetime.fromisoformat(action_state['new_start'])
                        updated_apt = AppointmentService.reschedule_appointment(
                            appointment_id=apt_id,
                            new_start_time=new_start,
                            reason="Patient requested reschedule via AI Chat",
                        )
                        action_state = {'action': 'reschedule_appointment', 'status': 'completed', 'appointment_id': updated_apt.id}
                        new_time_display = new_start.strftime('%Y-%m-%d at %I:%M %p')
                        if lang == 'hi':
                            resp = f"✅ आपका अपॉइंटमेंट सफलतापूर्वक रीशेड्यूल कर दिया गया है। नया समय: {new_time_display} (बुकिंग आईडी: #{updated_apt.id})।"
                        elif lang == 'hinglish':
                            resp = f"✅ Aapka appointment successfully reschedule ho gaya hai. New time: {new_time_display} (Booking ID: #{updated_apt.id})."
                        else:
                            resp = f"✅ Your appointment has been successfully rescheduled to {new_time_display} (Booking ID: #{updated_apt.id})."
                        return {
                            "response": resp,
                            "intent": "rescheduling",
                            "sentiment": "positive",
                            "sources": [],
                            "tools_executed": tools_executed,
                            "requires_escalation": False,
                            "action_state": action_state,
                            "language": lang,
                        }
                    except Exception as e:
                        action_state['status'] = 'failed'
                        return {
                            "response": f"Rescheduling failed: {str(e)}",
                            "intent": "rescheduling",
                            "sentiment": "negative",
                            "sources": [],
                            "tools_executed": [],
                            "requires_escalation": False,
                            "action_state": action_state,
                            "language": lang,
                        }

                elif action == 'cancel_appointment':
                    try:
                        apt_id = action_state['appointment_id']
                        cancelled_apt = AppointmentService.cancel_appointment(
                            appointment_id=apt_id,
                            reason="Cancelled by patient via AI Chat",
                        )
                        action_state = {'action': 'cancel_appointment', 'status': 'completed', 'appointment_id': cancelled_apt.id}
                        if lang == 'hi':
                            resp = f"✅ आपका अपॉइंटमेंट #{cancelled_apt.id} सफलतापूर्वक रद्द (cancel) कर दिया गया है।"
                        elif lang == 'hinglish':
                            resp = f"✅ Aapka appointment #{cancelled_apt.id} successfully cancel kar diya gaya hai."
                        else:
                            resp = f"✅ Your appointment #{cancelled_apt.id} has been successfully cancelled."
                        return {
                            "response": resp,
                            "intent": "cancellation",
                            "sentiment": "neutral",
                            "sources": [],
                            "tools_executed": tools_executed,
                            "requires_escalation": False,
                            "action_state": action_state,
                            "language": lang,
                        }
                    except Exception as e:
                        return {
                            "response": f"Cancellation failed: {str(e)}",
                            "intent": "cancellation",
                            "sentiment": "negative",
                            "sources": [],
                            "tools_executed": [],
                            "requires_escalation": False,
                            "action_state": action_state,
                            "language": lang,
                        }

            elif is_deny:
                action_state = {}
                if lang == 'hi':
                    resp = "ठीक है, मैंने इस अनुरोध को रद्द कर दिया है। मैं आपकी और क्या मदद कर सकता हूँ?"
                elif lang == 'hinglish':
                    resp = "Theek hai, maine is request ko cancel kar diya hai. Main aapki aur kya help kar sakta hoon?"
                else:
                    resp = "Understood. I have cancelled the pending action. How else may I assist you?"
                return {
                    "response": resp,
                    "intent": "general_inquiry",
                    "sentiment": "neutral",
                    "sources": [],
                    "tools_executed": [],
                    "requires_escalation": False,
                    "action_state": action_state,
                    "language": lang,
                }

        # 6. Intent: Appointment Rescheduling Flow
        if any(w in lower_msg for w in ['reschedule', 'change appointment', 'badalna', 'time change']):
            intent = "rescheduling"
            # Find patient's latest active appointment
            active_apt = Appointment.objects.filter(
                customer=customer,
                status__in=['scheduled', 'confirmed'],
                start_time__gte=timezone.now(),
            ).order_by('start_time').first()

            if not active_apt:
                if lang == 'hi':
                    resp = "आपके पास रीशेड्यूल करने के लिए कोई आगामी अपॉइंटमेंट नहीं मिला। क्या आप नया अपॉइंटमेंट बुक करना चाहते हैं?"
                elif lang == 'hinglish':
                    resp = "Aapka koi upcoming appointment nahi mila jise reschedule kiya ja sake. Kya aap new appointment book karna chahte hain?"
                else:
                    resp = "You do not have any upcoming appointments available to reschedule. Would you like to book a new appointment?"
                return {
                    "response": resp,
                    "intent": intent,
                    "sentiment": "neutral",
                    "sources": [],
                    "tools_executed": [],
                    "requires_escalation": False,
                    "action_state": {},
                    "language": lang,
                }

            # Propose rescheduling
            # Parse requested date / time if provided
            tomorrow = timezone.now().date() + timedelta(days=1)
            new_date = tomorrow
            target_hour = 11
            new_start = timezone.make_aware(datetime(new_date.year, new_date.month, new_date.day, target_hour, 0))
            
            action_state = {
                'action': 'reschedule_appointment',
                'status': 'awaiting_confirmation',
                'appointment_id': active_apt.id,
                'new_start': new_start.isoformat(),
            }
            time_str = new_start.strftime('%Y-%m-%d at %I:%M %p')
            if lang == 'hi':
                resp = f"आपकी वर्तमान बुकिंग #{active_apt.id} ({active_apt.start_time.strftime('%Y-%m-%d %I:%M %p')}) को {time_str} पर रीशेड्यूल किया जा सकता है। क्या आप पुष्टि (confirm) करते हैं?"
            elif lang == 'hinglish':
                resp = f"Aapki current booking #{active_apt.id} ko {time_str} par reschedule kiya ja sakta hai. Kya aap iski pushti (confirm) karte hain?"
            else:
                resp = f"Your current booking #{active_apt.id} ({active_apt.start_time.strftime('%Y-%m-%d %I:%M %p')}) can be rescheduled to {time_str}. Would you like to confirm this reschedule?"

            return {
                "response": resp,
                "intent": intent,
                "sentiment": "neutral",
                "sources": [],
                "tools_executed": [],
                "requires_escalation": False,
                "action_state": action_state,
                "language": lang,
            }

        # 7. Intent: Appointment Cancellation Flow
        if any(w in lower_msg for w in ['cancel appointment', 'radd', 'cancellation', 'cancel my appointment']):
            intent = "cancellation"
            active_apt = Appointment.objects.filter(
                customer=customer,
                status__in=['scheduled', 'confirmed'],
                start_time__gte=timezone.now(),
            ).order_by('start_time').first()

            if not active_apt:
                if lang == 'hi':
                    resp = "रद्द करने के लिए आपका कोई सक्रिय अपॉइंटमेंट नहीं मिला।"
                elif lang == 'hinglish':
                    resp = "Cancel karne ke liye aapka koi active appointment nahi mila."
                else:
                    resp = "No active upcoming appointments were found for your account."
                return {
                    "response": resp,
                    "intent": intent,
                    "sentiment": "neutral",
                    "sources": [],
                    "tools_executed": [],
                    "requires_escalation": False,
                    "action_state": {},
                    "language": lang,
                }

            action_state = {
                'action': 'cancel_appointment',
                'status': 'awaiting_confirmation',
                'appointment_id': active_apt.id,
            }
            apt_time = active_apt.start_time.strftime('%Y-%m-%d at %I:%M %p')
            doc_name = active_apt.staff_member.get_full_name() or active_apt.staff_member.username
            if lang == 'hi':
                resp = f"क्या आप निश्चित रूप से {doc_name} के साथ {apt_time} का अपना अपॉइंटमेंट #{active_apt.id} रद्द करना चाहते हैं? पुष्टि के लिए 'हाँ' कहें।"
            elif lang == 'hinglish':
                resp = f"Kya aap sure hain ki aap Dr. {doc_name} ke saath {apt_time} ka apna appointment #{active_apt.id} cancel karna chahte hain? Confirm karne ke liye 'Haan' boleih."
            else:
                resp = f"Are you sure you want to cancel your appointment #{active_apt.id} with {doc_name} on {apt_time}? Please reply 'Yes' to confirm cancellation."

            return {
                "response": resp,
                "intent": intent,
                "sentiment": "neutral",
                "sources": [],
                "tools_executed": [],
                "requires_escalation": False,
                "action_state": action_state,
                "language": lang,
            }

        # 8. Intent: New Booking Flow (Multi-Turn parameter collection)
        if any(w in lower_msg for w in ['book', 'appointment', 'schedule', 'doctor', 'apointment', 'milna', 'dikhana', 'अपॉइंटमेंट', 'डॉक्टर', 'दिखाना', 'इलाज', 'मिलना', 'बुकिंग']):
            intent = "scheduling"
            sentiment = "positive"

            # Step 1: Detect or recall Doctor
            doc_info = ToolRegistry.match_doctor(user_text)
            doctor_id = doc_info['id'] if doc_info else action_state.get('doctor_id')
            
            # Step 2: Detect or recall Date
            target_date = None
            if 'tomorrow' in lower_msg or 'kal' in lower_msg:
                target_date = timezone.now().date() + timedelta(days=1)
            elif 'today' in lower_msg or 'aaj' in lower_msg:
                target_date = timezone.now().date()
            else:
                date_match = re.search(r'\b(202\d-\d{2}-\d{2})\b', user_text)
                if date_match:
                    try:
                        target_date = datetime.strptime(date_match.group(1), '%Y-%m-%d').date()
                    except ValueError:
                        pass
            
            if not target_date and action_state.get('date'):
                try:
                    target_date = datetime.strptime(action_state['date'], '%Y-%m-%d').date()
                except ValueError:
                    pass

            # Step 3: Detect or recall Time slot
            target_hour = None
            time_match = re.search(r'\b(\d{1,2})\s*(am|pm|baje|:00)?\b', lower_msg)
            if time_match:
                try:
                    h = int(time_match.group(1))
                    ampm = time_match.group(2) or ''
                    if 'pm' in ampm and h < 12:
                        h += 12
                    elif 'am' in ampm and h == 12:
                        h = 0
                    if 9 <= h <= 17:
                        target_hour = h
                except ValueError:
                    pass

            if target_hour is None and action_state.get('hour'):
                target_hour = action_state.get('hour')

            # Default to tomorrow 10 AM if user expressed general intent but didn't specify
            if not target_date:
                target_date = timezone.now().date() + timedelta(days=1)
            if target_hour is None:
                target_hour = 10

            # Verify doctor
            if not doctor_id:
                doctors = ToolRegistry.get_available_doctors()
                doctor_id = doctors[0]['id'] if doctors else None

            # Retrieve real availability for that doctor and date
            avail = AppointmentService.get_available_slots(staff_id=doctor_id, date_str=str(target_date))
            tools_executed.append({"tool": "check_appointment_availability", "date": str(target_date), "doctor_id": doctor_id})

            # Check if requested slot is available
            slot_found = None
            for s in avail.get('slots', []):
                # Match start hour
                s_start = datetime.fromisoformat(s['start'])
                if s_start.hour == target_hour and s['available']:
                    slot_found = s
                    break

            if not slot_found:
                # Find first available slot
                available_slots = [s for s in avail.get('slots', []) if s['available']]
                if available_slots:
                    slot_found = available_slots[0]
                    target_hour = datetime.fromisoformat(slot_found['start']).hour

            if slot_found:
                slot_start = datetime.fromisoformat(slot_found['start'])
                slot_end = datetime.fromisoformat(slot_found['end'])
                doc_obj = User.objects.get(pk=doctor_id)
                doc_name = doc_obj.get_full_name() or f"Dr. {doc_obj.username}"
                dept = doc_obj.profile.department if hasattr(doc_obj, 'profile') else 'General Medicine'
                
                # Update action state to awaiting confirmation
                action_state = {
                    'action': 'book_appointment',
                    'status': 'awaiting_confirmation',
                    'doctor_id': doctor_id,
                    'doctor_name': doc_name,
                    'date': str(target_date),
                    'hour': target_hour,
                    'start_time': slot_start.isoformat(),
                    'end_time': slot_end.isoformat(),
                }

                time_str = slot_start.strftime('%I:%M %p')
                date_str = target_date.strftime('%Y-%m-%d')
                
                if lang == 'hi':
                    resp = (
                        f"हमारे पास {doc_name} ({dept}) के साथ दिनांक {date_str} को समय {time_str} पर स्लॉट उपलब्ध है।\n"
                        f"परामर्श शुल्क (Fee): ₹1,000 / $50.\n\n"
                        f"क्या आप इस अपॉइंटमेंट की पुष्टि (confirm) करना चाहते हैं? कृपया 'हाँ' या 'पुष्टि करें' कहें।"
                    )
                elif lang == 'hinglish':
                    resp = (
                        f"Humare paas {doc_name} ({dept}) ke saath date {date_str} ko time {time_str} par slot available hai.\n"
                        f"Consultation Fee: ₹1,000 / $50.\n\n"
                        f"Kya aap is appointment ko confirm karna chahte hain? Kripya 'Haan' ya 'Confirm' boleih."
                    )
                else:
                    resp = (
                        f"I have found an available slot with {doc_name} ({dept}) on {date_str} at {time_str}.\n"
                        f"Consultation Fee: $50 (₹1,000).\n\n"
                        f"Would you like me to confirm this booking? Please reply 'Yes' or 'Confirm' to proceed."
                    )

                return {
                    "response": resp,
                    "intent": intent,
                    "sentiment": sentiment,
                    "sources": [],
                    "tools_executed": tools_executed,
                    "requires_escalation": False,
                    "action_state": action_state,
                    "language": lang,
                }
            else:
                if lang == 'hi':
                    resp = f"क्षमा करें, {target_date} को कोई स्लॉट उपलब्ध नहीं है। कृपया कोई अन्य तारीख चुनें।"
                elif lang == 'hinglish':
                    resp = f"Sorry, {target_date} ko koi slot available nahi hai. Kripya doosri date select karein."
                else:
                    resp = f"I'm sorry, no slots are available on {target_date}. Please choose another date or contact our clinic directly."
                return {
                    "response": resp,
                    "intent": intent,
                    "sentiment": "neutral",
                    "sources": [],
                    "tools_executed": tools_executed,
                    "requires_escalation": False,
                    "action_state": {},
                    "language": lang,
                }

        # 9. Knowledge Base Grounding (Phase 7)
        kb_results = ToolRegistry.search_knowledge_base(user_text)
        tools_executed.append({
            "tool": "search_knowledge_base",
            "query": user_text,
            "results_found": len(kb_results),
        })
        for item in kb_results:
            sources.append({
                "id": item["id"],
                "title": item["title"],
                "category": item["category"],
            })

        # 10. Generate Response: Real Gemini API or Grounded Synthesizer
        ai_response_text = ""
        if self.api_key:
            try:
                from google import genai
                client = genai.Client(api_key=self.api_key)

                context_articles = "\n\n".join(
                    [f"Article: {k['title']} ({k['category']})\n{k['snippet']}" for k in kb_results]
                )
                system_prompt = (
                    "You are OPERA AI, an intelligent, empathetic Clinic Operations Chatbot. "
                    f"Respond in the user's language: {lang.upper()} (English, Hindi, or Hinglish). "
                    "Use ONLY verified clinic facts from the provided Knowledge Base below. "
                    "If a clinic policy, fee, or schedule is not in the knowledge base, state honestly that you do not have that information and offer to connect with clinic staff. "
                    "NEVER provide medical diagnosis or prescribe medications.\n\n"
                    f"CLINIC KNOWLEDGE BASE:\n{context_articles if context_articles else 'No specific articles found.'}"
                )

                response = client.models.generate_content(
                    model=self.model_name,
                    contents=f"{system_prompt}\n\nPatient message: {user_text}",
                )
                if response and hasattr(response, 'text') and response.text:
                    ai_response_text = response.text.strip()
            except Exception as e:
                logger.warning("Gemini API call encountered exception: %s. Using grounded synthesizer.", str(e))

        # Grounded domain synthesizer fallback
        if not ai_response_text:
            if kb_results:
                top = kb_results[0]
                if lang == 'hi':
                    ai_response_text = f"क्लिनिक जानकारी ('{top['title']}'):\n\n{top['snippet']}\n\nक्या आपको अपॉइंटमेंट बुक करने या किसी अन्य जानकारी में मदद चाहिए?"
                elif lang == 'hinglish':
                    ai_response_text = f"Clinic ki verified jankari ('{top['title']}'):\n\n{top['snippet']}\n\nKya aapko appointment book karne me aur koi madad chahiye?"
                else:
                    ai_response_text = f"According to our clinic records regarding '{top['title']}':\n\n{top['snippet']}\n\nWould you like to book an appointment or speak with our staff?"
            else:
                if lang == 'hi':
                    ai_response_text = "नमस्ते! मैं OPERA AI क्लिनिक ऑपरेशंस असिस्टेंट हूँ। मैं आपकी अपॉइंटमेंट बुकिंग, रीशेड्यूलिंग, क्लिनिक समय और डॉक्टर परामर्श में कैसे सहायता कर सकता हूँ?"
                elif lang == 'hinglish':
                    ai_response_text = "Namaste! Main OPERA AI Clinic Operations Assistant hoon. Main aapki appointment booking, rescheduling, clinic timings aur doctor consultation me madad kar sakta hoon. Aapko kis doctor se milna hai?"
                else:
                    ai_response_text = "Hello! I am OPERA AI, your clinic operations assistant. I can help you schedule, reschedule, or cancel consultations with our specialists, answer questions about clinic hours, or connect you with clinic staff. How may I assist you today?"

        return {
            "response": ai_response_text,
            "intent": intent,
            "sentiment": sentiment,
            "sources": sources,
            "tools_executed": tools_executed,
            "requires_escalation": requires_escalation,
            "action_state": action_state,
            "language": lang,
        }
