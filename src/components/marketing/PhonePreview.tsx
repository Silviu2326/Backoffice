import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PhonePreviewProps {
  title: string;
  body: string;
  platform?: 'ios' | 'android';
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  title,
  body,
  platform = 'ios'
}) => {
  const currentTime = new Date();
  const dateString = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Platform specific styles
  const isIOS = platform === 'ios';

  return (
    <div className="flex justify-center items-center h-full p-4 sm:p-8 overflow-hidden">
      <div className={cn(
        "relative w-[300px] h-[600px] bg-black shadow-2xl overflow-hidden transition-all duration-300",
        isIOS ? "rounded-[3rem] border-[8px] border-gray-800" : "rounded-[1.5rem] border-[4px] border-gray-800"
      )}>
        {/* Notch / Dynamic Island (iOS) or Camera hole (Android) */}
        {isIOS ? (
          <div className="absolute top-0 inset-x-0 h-7 bg-black z-20 rounded-b-2xl mx-auto w-[35%] left-0 right-0"></div>
        ) : (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-20"></div>
        )}
        
        {/* Screen Content */}
        <div className="w-full h-full bg-cover bg-center relative flex flex-col" 
             style={{ backgroundImage: 'linear-gradient(to bottom right, #4c1d95, #c2410c)' }}>
          
          {/* Status Bar */}
          <div className="flex justify-between px-6 pt-3 text-white text-xs font-medium z-10">
            <span>9:41</span>
            <div className="flex gap-1 items-center">
              <div className="w-4 h-3 bg-white/80 rounded-sm"></div>
              <div className="w-3 h-3 bg-white/80 rounded-full"></div>
            </div>
          </div>

          {/* Lock Screen Time */}
          <div className="mt-12 text-center text-white z-10">
            <div className={cn(
              "font-light tracking-tight opacity-90 transition-all",
              isIOS ? "text-7xl" : "text-6xl font-normal"
            )}>
               {currentTime.getHours()}:{currentTime.getMinutes().toString().padStart(2, '0')}
            </div>
            <div className="text-lg font-medium mt-1 opacity-80">
              {dateString}
            </div>
          </div>

          {/* Notification List */}
          <div className="mt-8 px-4 space-y-2 z-10 flex-1">
            {/* The Notification */}
            {(title || body) && (
              <div className={cn(
                "backdrop-blur-xl shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in",
                isIOS 
                  ? "bg-white/20 rounded-2xl p-4 text-white border border-white/10" 
                  : "bg-white rounded-lg p-4 text-gray-900"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center",
                    isIOS ? "bg-brand-orange" : "bg-brand-orange"
                  )}>
                    <Bell size={12} className="text-white" />
                  </div>
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-wider opacity-90",
                    !isIOS && "text-gray-600"
                  )}>APP NAME</span>
                  <span className={cn(
                    "text-xs opacity-60 ml-auto",
                    !isIOS && "text-gray-500"
                  )}>Now</span>
                </div>
                <div className="space-y-0.5">
                   <h4 className={cn("font-semibold text-sm", !isIOS && "text-gray-900")}>{title || 'Notification Title'}</h4>
                   <p className={cn("text-sm opacity-90 leading-snug", !isIOS && "text-gray-600")}>{body || 'Notification body text goes here...'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Handle */}
          {isIOS && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/50 rounded-full z-10"></div>
          )}
        </div>
      </div>
    </div>
  );
};
