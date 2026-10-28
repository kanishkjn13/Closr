import React, { useState } from 'react';
import { cn, getInitials } from '../../lib/utils';
import { User } from 'lucide-react';
export const Avatar = ({ src, alt = '', name, size = 'md', className, ...props }) => {
    const [imageError, setImageError] = useState(false);
    const sizes = {
        xs: { container: 'w-6 h-6', text: 'text-[10px]', icon: 'w-3 h-3' },
        sm: { container: 'w-8 h-8', text: 'text-xs', icon: 'w-4 h-4' },
        md: { container: 'w-10 h-10', text: 'text-sm font-medium', icon: 'w-5 h-5' },
        lg: { container: 'w-12 h-12', text: 'text-base font-semibold', icon: 'w-6 h-6' },
        xl: { container: 'w-16 h-16', text: 'text-lg font-bold', icon: 'w-8 h-8' },
    };
    const currentSize = sizes[size];
    const initials = name ? getInitials(name) : '';
    return (<div className={cn('relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none bg-closr-sage/70 text-closr-forest border border-closr-border', currentSize.container, className)} {...props}>
      {src && !imageError ? (<img src={src} alt={alt || name || 'Avatar'} onError={() => setImageError(true)} className="w-full h-full object-cover"/>) : initials ? (<span className={cn('tracking-tight font-medium', currentSize.text)}>
          {initials}
        </span>) : (<User className={cn('text-closr-forest/70', currentSize.icon)} aria-hidden="true"/>)}
    </div>);
};
