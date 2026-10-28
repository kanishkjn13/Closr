import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { cn } from '../../lib/utils';
export const SearchInput = React.forwardRef(({ className, value, onChange, onClear, placeholder = 'Search patients, slots, notes...', ...props }, ref) => {
    const hasValue = Boolean(value && String(value).length > 0);
    return (<Input ref={ref} value={value} onChange={onChange} placeholder={placeholder} className={cn('bg-closr-card/80 backdrop-blur-sm', className)} leftIcon={<Search className="w-4 h-4 text-closr-text-muted" aria-hidden="true"/>} rightIcon={hasValue && onClear ? (<button type="button" onClick={onClear} aria-label="Clear search input" className="p-1 rounded-full hover:bg-closr-sage/60 text-closr-text-muted hover:text-closr-text transition-colors">
              <X className="w-3.5 h-3.5"/>
            </button>) : undefined} {...props}/>);
});
SearchInput.displayName = 'SearchInput';
