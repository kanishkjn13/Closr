import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Home, MessageSquare, Calendar, Compass } from 'lucide-react';
export const NotFoundPage = () => {
    const navigate = useNavigate();
    return (<div className="min-h-[75vh] flex items-center justify-center px-4 py-12 text-center animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-closr-card border border-closr-border rounded-3xl p-8 sm:p-10 shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-closr-pale border border-closr-border/80 flex items-center justify-center mx-auto mb-5 text-closr-forest shadow-2xs">
          <Compass className="w-8 h-8 stroke-[1.7] animate-pulse"/>
        </div>

        <div className="inline-flex mb-3">
          <Badge variant="neutral" size="sm" className="bg-closr-sage/30 text-closr-forest font-semibold text-[11px]">
            Error 404 · Resource Not Found
          </Badge>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-closr-text mb-3 tracking-tight">
          Clinic Route Not Found
        </h1>

        <p className="text-sm text-closr-text-muted leading-relaxed max-w-md mx-auto mb-8">
          The requested path could not be located in this Closr deployment. Please check the URL or use one of the standard clinic navigation paths below.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => navigate('/')} className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Home className="w-4 h-4"/>
            <span>Back to Home</span>
          </Button>

          <Button variant="outline" size="md" onClick={() => navigate('/patient/dashboard')} className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4"/>
            <span>Patient Portal</span>
          </Button>

          <Button variant="ghost" size="md" onClick={() => navigate('/admin/dashboard')} className="w-full sm:w-auto flex items-center justify-center gap-2 text-closr-forest">
            <MessageSquare className="w-4 h-4"/>
            <span>Admin Dashboard</span>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-closr-border/60 text-center">
          <p className="text-xs text-closr-text-muted">
            Closr AI Healthcare Receptionist · Client-Side Demo Routing
          </p>
        </div>
      </div>
    </div>);
};
