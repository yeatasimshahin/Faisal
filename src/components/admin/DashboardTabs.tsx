import React from 'react';
import TestimonialManager from './TestimonialManager';
import UserManagement from './UserManagement';
import ContentEditor from './ContentEditor';
import CouponManager from './CouponManager';
import ProjectManager from './ProjectManager';
import ReviewModerator from './ReviewModerator';
import BlogManager from './BlogManager';
import AnalyticsHome from './AnalyticsHome';
import MessageInbox from './MessageInbox';
import BookingManager from './BookingManager';
import SettingsManager from './SettingsManager';
import SubscriberList from './SubscriberList';

interface DashboardTabsProps {
   activeTab: 'overview' | 'users' | 'content' | 'coupons' | 'reviews' | 'messages' | 'bookings' | 'settings';
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab }) => {
   return (
      <div className="w-full">
         {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-500">
               <AnalyticsHome />
            </div>
         )}

         {activeTab === 'users' && (
            <div className="space-y-12">
               <UserManagement />
               <SubscriberList />
            </div>
         )}

         {activeTab === 'bookings' && <BookingManager />}

         {activeTab === 'content' && (
            <div className="space-y-16">
               <section>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-[1px] w-12 bg-red-600" />
                     <h2 className="text-xl font-light uppercase tracking-widest text-white">General Settings</h2>
                  </div>
                  <ContentEditor />
               </section>

               <section>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-[1px] w-12 bg-red-600" />
                     <h2 className="text-xl font-light uppercase tracking-widest text-white">Project Portfolio</h2>
                  </div>
                  <ProjectManager />
               </section>

               <section>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-[1px] w-12 bg-red-600" />
                     <h2 className="text-xl font-light uppercase tracking-widest text-white">Journal / Blogs</h2>
                  </div>
                  <BlogManager />
               </section>

               <section>
                  <div className="flex items-center gap-4 mb-8">
                     <div className="h-[1px] w-12 bg-red-600" />
                     <h2 className="text-xl font-light uppercase tracking-widest text-white">Testimonials</h2>
                  </div>
                  <TestimonialManager />
               </section>

            </div>
         )}

         {activeTab === 'coupons' && <CouponManager />}
         {activeTab === 'reviews' && <ReviewModerator />}
         {activeTab === 'messages' && <MessageInbox />}
         {activeTab === 'settings' && <SettingsManager />}
      </div>
   );
};

export default DashboardTabs;