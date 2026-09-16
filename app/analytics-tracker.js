'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AnalyticsTracker() {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        let visitorId = localStorage.getItem('supplierhub_visitor_id');

        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem(
            'supplierhub_visitor_id',
            visitorId
          );
        }

        const path = window.location.pathname;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        await supabase.from('analytics_events').insert({
          event_type: 'page_view',
          visitor_id: visitorId,
          user_id: user?.id || null,
          path,
          metadata: {
            referrer: document.referrer || null,
          },
        });
      } catch (error) {
        console.error(
          'Analytics tracking error:',
          error
        );
      }
    };

    trackPageView();
  }, []);

  return null;
}
