from datetime import time
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from knowledge.models import KnowledgeArticle
from authentication.models import UserProfile
from customers.models import Customer


class Command(BaseCommand):
    help = "Seeds OPERA AI clinic doctors, operating hours, and knowledge base articles."

    def handle(self, *args, **options):
        self.stdout.write("Seeding clinic knowledge articles...")

        articles_data = [
            {
                "title": "Clinic Overview, Operating Hours and Location",
                "category": "General",
                "content": (
                    "OPERA AI Health Clinic is located at 104 Medical Enclave, Health City. "
                    "Our operating hours are Monday through Saturday from 09:00 AM to 06:00 PM (18:00). "
                    "The clinic is closed on Sundays and national public holidays. "
                    "Contact phone: +91 98765 43210. Email: support@opera-ai.clinic."
                ),
            },
            {
                "title": "Doctors, Specialties and Consultation Fees",
                "category": "Product",
                "content": (
                    "OPERA AI Clinic features the following board-certified specialists:\n"
                    "1. Dr. Sarah Connor - General Physician & Internal Medicine. Consultation fee: $50 (₹1,000). Available Mon-Fri 09:00 - 14:00.\n"
                    "2. Dr. Mark Stone - Dermatology & Skin Care. Consultation fee: $75 (₹1,500). Available Mon-Sat 10:00 - 17:00.\n"
                    "3. Dr. Elena Rostova - Cardiology & Cardiovascular Health. Consultation fee: $100 (₹2,000). Available Tue-Sat 11:00 - 18:00."
                ),
            },
            {
                "title": "Appointment, Rescheduling and Cancellation Policies",
                "category": "Policy",
                "content": (
                    "Appointments must be scheduled during clinic working hours (09:00 - 18:00, Mon-Sat). "
                    "Rescheduling and cancellation are completely free if requested at least 2 hours before the scheduled time slot. "
                    "Cancellations made less than 2 hours before or no-shows may incur a 20% administrative fee."
                ),
            },
            {
                "title": "Accepted Payment Methods and Insurance",
                "category": "Billing",
                "content": (
                    "We accept Cash, major Credit/Debit Cards (Visa, MasterCard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm), and Net Banking. "
                    "We also provide direct billing with leading health insurance providers."
                ),
            },
            {
                "title": "Emergency Medical Notice and Protocol",
                "category": "Policy",
                "content": (
                    "OPERA AI chatbot does not provide emergency medical diagnosis or treatment. "
                    "For life-threatening emergencies (such as acute chest pain, severe breathing difficulty, stroke symptoms, or severe trauma), "
                    "call emergency services immediately at 112 / 102 / 911 or visit the nearest hospital emergency room."
                ),
            },
        ]

        for item in articles_data:
            art, created = KnowledgeArticle.objects.update_or_create(
                title=item["title"],
                defaults={
                    "category": item["category"],
                    "content": item["content"],
                    "status": "published",
                }
            )
            self.stdout.write(f"  {'Created' if created else 'Updated'}: {art.title}")

        self.stdout.write("Seeding clinic doctor user accounts...")
        doctors_data = [
            {"username": "dr_sarah", "first_name": "Sarah", "last_name": "Connor", "email": "dr.sarah@opera-ai.clinic", "dept": "General Medicine"},
            {"username": "dr_mark", "first_name": "Mark", "last_name": "Stone", "email": "dr.mark@opera-ai.clinic", "dept": "Dermatology"},
            {"username": "dr_elena", "first_name": "Elena", "last_name": "Rostova", "email": "dr.elena@opera-ai.clinic", "dept": "Cardiology"},
        ]

        for doc in doctors_data:
            user, created = User.objects.get_or_create(
                username=doc["username"],
                defaults={
                    "first_name": doc["first_name"],
                    "last_name": doc["last_name"],
                    "email": doc["email"],
                    "is_staff": True,
                }
            )
            if created:
                user.set_password("ClinicStaff@2026")
                user.save()
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.role = 'agent'
            profile.department = doc["dept"]
            profile.save()
            self.stdout.write(f"  {'Created' if created else 'Found'}: {user.get_full_name()} ({doc['dept']})")

        self.stdout.write(self.style.SUCCESS("Clinic data seeded successfully!"))
