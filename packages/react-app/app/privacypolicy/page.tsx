// app/privacypolicy/page.tsx

'use client';

import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last Updated: May 19, 2025</p>

      <p className="mb-6">
        Thank you for choosing to be part of our community at Celo DAO Europe, doing business as
        Celo Europe ("Celo Europe", "we", "us", or "our"). We are committed to protecting your
        personal information and your right to privacy. If you have any questions or concerns about
        this privacy notice or our practices, please contact us at{' '}
        <a href="mailto:rica@celoeu.org" className="text-blue-600 underline">rica@celoeu.org</a>.
      </p>

      <p className="mb-4">
        This privacy notice describes how we might use your information if you:
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>Visit our website at <a href="https://www.celoeu.org" className="text-blue-600 underline">https://www.celoeu.org</a></li>
        <li>Engage with us in other related ways including sales, marketing, or events</li>
      </ul>

      <p className="mb-6">
        By "Website", we mean any Celo Europe site linking to this notice. By "Services", we refer
        to our Website and related operations.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. What information do we collect?</h2>
      <p className="mb-4">In Short: We collect personal information that you provide to us.</p>
      <p className="mb-6">
        This includes your email address or any other similar data you voluntarily submit through
        forms or interactions. Please ensure your information is accurate and up-to-date.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. How do we use your information?</h2>
      <p className="mb-6">
        We use your personal data to communicate, market, deliver services, comply with laws, and
        improve user experience. This includes sending promotional content and delivering targeted
        advertising where permitted.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Will your information be shared?</h2>
      <p className="mb-6">
        We only share your data with your consent, for legal compliance, protection of rights, or
        business operations like mergers or acquisitions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Do we use cookies and tracking?</h2>
      <p className="mb-6">
        Yes. We may use cookies, pixels, or similar technologies. See our Cookie Notice for more
        information.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. How long do we keep your data?</h2>
      <p className="mb-6">
        We retain your information only as long as necessary, typically no longer than 2 years,
        unless required by law.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. How do we protect your data?</h2>
      <p className="mb-6">
        We implement organizational and technical measures to protect your data. However, no method
        is completely secure, and transmission is at your own risk.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Do we collect from minors?</h2>
      <p className="mb-6">
        No. Users must be 18 years or older. We do not knowingly collect data from children.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">8. What are your privacy rights?</h2>
      <p className="mb-6">
        In the EEA or UK, you can request access, correction, deletion, restriction, or data
        portability. You may withdraw consent at any time. Contact us to exercise these rights.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">9. Do-Not-Track (DNT) features</h2>
      <p className="mb-6">
        We currently do not respond to DNT browser signals due to lack of a standard. If this
        changes, we will update this policy accordingly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">10. Updates to this notice</h2>
      <p className="mb-6">
        We may update this policy to remain compliant with relevant laws. Please check this page
        periodically for changes.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">11. Contacting us</h2>
      <p className="mb-6">
        For any questions, reach us at{' '}
        <a href="mailto:hi@celodao.eu" className="text-blue-600 underline">hi@celodao.eu</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        12. Reviewing, updating, or deleting your data
      </h2>
      <p className="mb-6">
        You can request access to or deletion of your data by submitting a request. Please contact
        us via email or use our support page when available.
      </p>
    </div>
  );
};

export default PrivacyPolicyPage;
