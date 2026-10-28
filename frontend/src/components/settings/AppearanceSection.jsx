import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { useToast } from '../ui/Toast';
import { settingsService } from '../../services/settingsService';
import { Palette, Sun, Clock, Calendar, Check, Save, RotateCcw } from 'lucide-react';
export const AppearanceSection = ({ initialAppearance, onSaved, }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({ ...initialAppearance });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const saved = settingsService.updateAppearance(formData);
            onSaved(saved);
            toast.success('Appearance & display preferences saved (demo)');
        }
        catch {
            toast.error('Failed to save appearance settings');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleReset = () => {
        setFormData({ ...initialAppearance });
        toast.info('Restored saved appearance preferences');
    };
    return (<div className="p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft text-left space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-lg text-closr-text flex items-center gap-2">
          <Palette className="w-5 h-5 text-closr-forest"/>
          Appearance & Display Formatting
        </h3>
        <p className="text-xs text-closr-text-muted mt-1">
          Adjust visual layout density, dashboard panels, and clinic calendar date/time formatting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Theme Palette Notice */}
        <div className="p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-2">
          <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-closr-amber"/>
            Design Theme
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border-2 border-closr-forest bg-[#F6F4EC] flex items-center justify-between shadow-soft">
              <div className="space-y-0.5">
                <span className="font-semibold text-xs text-closr-text flex items-center gap-1.5">
                  Warm Ivory & Forest Green
                </span>
                <span className="text-[10px] text-closr-text-muted block">
                  Original Closr clinic aesthetic (#F6F4EC)
                </span>
              </div>
              <div className="w-5 h-5 rounded-full bg-closr-forest text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]"/>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-closr-border bg-gray-50 opacity-60 cursor-not-allowed flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-semibold text-xs text-closr-text">Dark Mode (OLED)</span>
                <span className="text-[10px] text-closr-text-muted block">
                  Preserved in light palette for clinical readability
                </span>
              </div>
              <span className="text-[10px] bg-closr-border px-1.5 py-0.5 rounded text-closr-text-muted">
                Off
              </span>
            </div>
          </div>
        </div>

        {/* Layout Density */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-closr-text">Interface Table & Card Density</label>
          <div className="grid grid-cols-2 gap-3">
            {[
            { id: 'comfortable', label: 'Comfortable', desc: 'Standard healthcare spacing with generous margins' },
            { id: 'compact', label: 'Compact', desc: 'Higher information density for busy front desk triage' },
        ].map((d) => (<button key={d.id} type="button" onClick={() => setFormData((prev) => ({
                ...prev,
                density: d.id,
            }))} className={`p-3 rounded-xl border text-left transition-all ${formData.density === d.id
                ? 'bg-closr-forest text-white border-closr-forest shadow-soft'
                : 'bg-white border-closr-border text-closr-text hover:bg-closr-sage/30'}`}>
                <span className="font-semibold text-xs block">{d.label}</span>
                <span className={`text-[10px] block mt-1 leading-snug ${formData.density === d.id ? 'text-white/80' : 'text-closr-text-muted'}`}>
                  {d.desc}
                </span>
              </button>))}
          </div>
        </div>

        {/* Date and Time Format Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-closr-forest"/>
              Calendar Date Format
            </label>
            <select value={formData.dateFormat} onChange={(e) => setFormData((prev) => ({
            ...prev,
            dateFormat: e.target.value,
        }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20">
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 29/10/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/29/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-10-29)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-closr-forest"/>
              Time Clock Format
            </label>
            <select value={formData.timeFormat} onChange={(e) => setFormData((prev) => ({
            ...prev,
            timeFormat: e.target.value,
        }))} className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20">
              <option value="12h">12-Hour Clock with AM/PM (e.g. 5:30 PM)</option>
              <option value="24h">24-Hour Military Format (e.g. 17:30)</option>
            </select>
          </div>
        </div>

        {/* Dashboard Quick Actions Toggle */}
        <div className="p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-3">
          <Switch checked={formData.showQuickActions} onChange={(val) => setFormData((prev) => ({ ...prev, showQuickActions: val }))} label="Display Quick Operations Cards on Home Dashboard" description="Show the 'Quick Actions' card on the desktop dashboard for rapid slot booking."/>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-closr-border flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1"/>
            Reset to Saved
          </Button>

          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            <Save className="w-3.5 h-3.5 mr-1"/>
            Save Appearance Settings
          </Button>
        </div>
      </form>
    </div>);
};
