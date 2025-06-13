// app/cookiepolicy/page.tsx

'use client';

import React from 'react';

const CookiePolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: May 19, 2025</p>

      <p className="mb-6">
        This Cookie Policy explains how Celo DAO Europe (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) uses cookies and similar technologies
        to recognize you when you visit our website at{' '}
        <a href="https://www.celoeu.org" className="text-blue-600 underline">https://www.celoeu.org</a>.
        It explains what these technologies are, why we use them, and your rights to control their use.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">What are cookies?</h2>
      <p className="mb-6">
        Cookies are small data files stored on your device when visiting a website. They are commonly used to
        make websites function efficiently, provide analytics, and enhance the user experience.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Why do we use cookies?</h2>
      <p className="mb-6">
        We use first-party cookies strictly for analytics purposes through Google Analytics. These cookies help us
        understand how users interact with our site so we can improve functionality, content, and overall performance.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">How can I control cookies?</h2>
      <p className="mb-6">
        You can choose to accept or reject non-essential cookies via the cookie consent banner shown on your first visit.
        Additionally, you may control cookies via your browser settings. Please note that blocking analytics cookies may
        limit our ability to improve the user experience.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Analytics Cookies Used</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        <li><strong>_ga</strong>: Used by Google Analytics to distinguish users. <br />Expires in: 2 years</li>
        <li><strong>_gid</strong>: Stores and updates a unique value for each page visited. <br />Expires in: 24 hours</li>
        <li><strong>_gat</strong>: Used to throttle request rate. <br />Expires in: 1 minute</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Other Tracking Technologies</h2>
      <p className="mb-6">
        We may use technologies like web beacons (also known as pixels or clear gifs) alongside cookies to monitor
        interactions, such as page views and email open rates. These technologies rely on cookies to function.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Do we serve targeted ads?</h2>
      <p className="mb-6">
        No. We do not use cookies for advertising or retargeting. We use cookies strictly for internal performance and usage tracking.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Will this policy change?</h2>
      <p className="mb-6">
        We may update this policy as our use of cookies evolves. The &quot;Last Updated&quot; date at the top of this page reflects
        the most recent changes. We encourage you to review this policy periodically.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">Where can I get more information?</h2>
      <p className="mb-6">
        If you have any questions about our use of cookies or this policy, please email us at{' '}
        <a href="mailto:rica@celoeu.org" className="text-blue-600 underline">rica@celoeu.org</a>.
      </p>
    </div>
  );
};

export default CookiePolicyPage;
