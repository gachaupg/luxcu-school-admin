import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Shield, CreditCard, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsAndPolicies = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("terms");

  const sections = [
    { id: "terms", label: "Terms & Conditions", icon: FileText },
    { id: "system", label: "System Policies", icon: Shield },
    { id: "payment", label: "Payment & Use Terms", icon: CreditCard },
    { id: "privacy", label: "Privacy & Data", icon: Settings },
    { id: "updates", label: "Policy Updates", icon: FileText },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "terms":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                  <p className="text-muted-foreground mb-3">
                    By accessing and using the Shule Track School Administration System, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and Shule Track.
                  </p>
                  <p className="text-muted-foreground">
                    If you do not agree with any part of these terms, you must not use our services.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Definitions</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>"Service"</strong> refers to the Shule Track School Administration System</li>
                    <li><strong>"User"</strong> refers to any individual accessing the system</li>
                    <li><strong>"School"</strong> refers to the educational institution using our services</li>
                    <li><strong>"Data"</strong> refers to all information processed through our system</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Permitted Use</h3>
                  <p className="text-muted-foreground mb-3">
                    The Service is intended for legitimate educational administration purposes only. You may use the Service to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Manage student information and records</li>
                    <li>Coordinate transportation and route management</li>
                    <li>Process payments and billing</li>
                    <li>Generate reports and analytics</li>
                    <li>Communicate with parents and staff</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">4. Prohibited Activities</h3>
                  <p className="text-muted-foreground mb-3">You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Use the Service for any unlawful or unauthorized purpose</li>
                    <li>Attempt to gain unauthorized access to any part of the Service</li>
                    <li>Share login credentials with unauthorized individuals</li>
                    <li>Upload malicious software or harmful content</li>
                    <li>Interfere with the proper functioning of the Service</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">5. Intellectual Property</h3>
                  <p className="text-muted-foreground">
                    All content, features, and functionality of the Service are owned by Shule Track and are protected by international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">6. Liability and Disclaimers</h3>
                  <p className="text-muted-foreground mb-3">
                    The Service is provided "as is" without warranties of any kind. Shule Track disclaims all warranties, express or implied, including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Warranties of merchantability and fitness for a particular purpose</li>
                    <li>Warranties regarding accuracy, reliability, or completeness of data</li>
                    <li>Warranties that the Service will be uninterrupted or error-free</li>
                    <li>Warranties regarding third-party content or services</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    In no event shall Shule Track be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of the Service.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">7. Termination and Suspension</h3>
                  <p className="text-muted-foreground mb-3">
                    Either party may terminate this agreement at any time with 30 days written notice. Shule Track reserves the right to suspend or terminate your access immediately if:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>You breach any terms of this agreement</li>
                    <li>You engage in fraudulent or illegal activities</li>
                    <li>You fail to pay fees when due</li>
                    <li>You pose a security risk to the Service or other users</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    Upon termination, your right to use the Service ceases immediately, and we may delete your data after a 90-day grace period.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">8. Governing Law and Dispute Resolution</h3>
                  <p className="text-muted-foreground mb-3">
                    This agreement shall be governed by the laws of Kenya. Any disputes arising from this agreement shall be resolved through:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>First, through good faith negotiations between the parties</li>
                    <li>If negotiations fail, through binding arbitration in Nairobi, Kenya</li>
                    <li>Arbitration shall be conducted in English and governed by Kenyan arbitration law</li>
                    <li>Each party shall bear their own legal costs unless otherwise determined by the arbitrator</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "system":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">System Policies</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Management</h3>
                  <p className="text-muted-foreground mb-3">
                    Each user is responsible for maintaining the security and confidentiality of their account credentials. Schools are responsible for managing user access and permissions within their organization.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Use strong passwords and enable two-factor authentication where available</li>
                    <li>Report suspected unauthorized access immediately</li>
                    <li>Regular review and update of user permissions</li>
                    <li>Prompt removal of access for departing staff members</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Backup & Recovery</h3>
                  <p className="text-muted-foreground mb-3">
                    Shule Track maintains robust backup systems to protect your data:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Daily automated backups with 30-day retention</li>
                    <li>Geographic redundancy across multiple data centers</li>
                    <li>99.9% uptime guarantee with 24/7 monitoring</li>
                    <li>Disaster recovery procedures tested quarterly</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">System Maintenance</h3>
                  <p className="text-muted-foreground mb-3">
                    Scheduled maintenance windows are announced 48 hours in advance. Emergency maintenance may occur with minimal notice to address security vulnerabilities or critical issues.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Security Measures</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>End-to-end encryption for data transmission</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>GDPR and COPPA compliance measures</li>
                    <li>Role-based access controls</li>
                    <li>Audit logs for all system activities</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Acceptable Use Policy</h3>
                  <p className="text-muted-foreground">
                    The system must be used in accordance with educational best practices and applicable laws. Any misuse, including attempts to circumvent security measures or access unauthorized data, will result in immediate account suspension and may be reported to relevant authorities.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Compliance and Legal Requirements</h3>
                  <p className="text-muted-foreground mb-3">
                    Shule Track is committed to maintaining compliance with applicable laws and regulations:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>FERPA Compliance:</strong> Family Educational Rights and Privacy Act compliance for student data protection</li>
                    <li><strong>COPPA Compliance:</strong> Children's Online Privacy Protection Act compliance for users under 13</li>
                    <li><strong>GDPR Compliance:</strong> General Data Protection Regulation compliance for EU data subjects</li>
                    <li><strong>Kenyan Data Protection Act:</strong> Compliance with local data protection regulations</li>
                    <li><strong>Educational Standards:</strong> Adherence to national and international educational technology standards</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Support and Service Level Agreement</h3>
                  <p className="text-muted-foreground mb-3">
                    We provide comprehensive support to ensure your success with our platform:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Uptime Guarantee:</strong> 99.9% uptime with 24/7 monitoring</li>
                    <li><strong>Response Times:</strong> Critical issues within 2 hours, general support within 24 hours</li>
                    <li><strong>Support Channels:</strong> Email, phone, and in-app chat support</li>
                    <li><strong>Training Resources:</strong> Comprehensive documentation, video tutorials, and webinars</li>
                    <li><strong>Dedicated Support:</strong> Enterprise customers receive dedicated account managers</li>
                    <li><strong>Maintenance Windows:</strong> Scheduled maintenance with advance notice</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">System Monitoring and Performance</h3>
                  <p className="text-muted-foreground mb-3">
                    Our systems are continuously monitored to ensure optimal performance:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Real-time performance monitoring and alerting</li>
                    <li>Automated scaling based on usage patterns</li>
                    <li>Regular performance optimization and updates</li>
                    <li>Capacity planning and resource management</li>
                    <li>Incident response and resolution procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Payment & Use Terms</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Subscription Plans</h3>
                  <p className="text-muted-foreground mb-3">
                    Shule Track offers flexible subscription plans to meet the needs of educational institutions of all sizes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Basic Plan:</strong> Core features for small schools (up to 200 students)</li>
                    <li><strong>Professional Plan:</strong> Advanced features for medium schools (up to 1,000 students)</li>
                    <li><strong>Enterprise Plan:</strong> Full feature set for large institutions (unlimited students)</li>
                    <li><strong>Custom Plans:</strong> Tailored solutions for specific requirements</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Billing Terms</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Subscriptions are billed monthly or annually in advance</li>
                    <li>Annual subscriptions receive a 15% discount</li>
                    <li>Payment is due within 30 days of invoice date</li>
                    <li>Late payments may incur a 1.5% monthly service charge</li>
                    <li>Failed payments may result in service suspension after 7 days</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Methods</h3>
                  <p className="text-muted-foreground mb-3">We accept the following payment methods:</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Credit cards (Visa, MasterCard, American Express)</li>
                    <li>Bank transfers (ACH/Wire)</li>
                    <li>Purchase orders for qualified institutions</li>
                    <li>Digital wallets (PayPal, Apple Pay, Google Pay)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Refund Policy</h3>
                  <p className="text-muted-foreground mb-3">
                    We offer a 30-day money-back guarantee for new subscriptions. Refund requests must be submitted within 30 days of initial purchase.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Pro-rated refunds available for annual subscriptions</li>
                    <li>No refunds for partial months of service</li>
                    <li>Refunds processed within 5-10 business days</li>
                    <li>Custom development work is non-refundable</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Price Changes</h3>
                  <p className="text-muted-foreground">
                    Shule Track reserves the right to modify pricing with 60 days advance notice. Existing subscribers will maintain their current pricing for the remainder of their billing period.
                  </p>
                </div>
                {/* AIzaSyAUyDgDkMwd1R73aUAurKiu8OQsZxK08ZY */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cancellation</h3>
                  <p className="text-muted-foreground">
                    Subscriptions may be cancelled at any time with 30 days notice. Upon cancellation, you will retain access to the service until the end of your current billing period. Data export options are available for 90 days post-cancellation.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Taxes and Fees</h3>
                  <p className="text-muted-foreground mb-3">
                    All prices are exclusive of applicable taxes. You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Value Added Tax (VAT) and other applicable taxes</li>
                    <li>Bank transfer fees and currency conversion charges</li>
                    <li>Late payment penalties and interest charges</li>
                    <li>Any additional fees imposed by payment processors</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Usage Limits and Overages</h3>
                  <p className="text-muted-foreground mb-3">
                    Each subscription plan includes specific usage limits:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Student capacity limits based on your plan</li>
                    <li>Storage limits for documents and media</li>
                    <li>API call limits for integrations</li>
                    <li>Support ticket limits per month</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    Overage charges may apply if you exceed your plan limits. We will notify you before applying overage charges and provide options to upgrade your plan.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Enterprise and Custom Agreements</h3>
                  <p className="text-muted-foreground mb-3">
                    For large institutions and custom requirements, we offer:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Custom pricing based on specific needs</li>
                    <li>Dedicated support and account management</li>
                    <li>Custom integrations and development work</li>
                    <li>On-premise deployment options</li>
                    <li>Volume discounts for multiple schools or districts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Privacy & Data Protection</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
                  <p className="text-muted-foreground mb-3">
                    We collect information necessary to provide our educational administration services:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Student Information:</strong> Names, grades, contact details, academic records</li>
                    <li><strong>Parent/Guardian Data:</strong> Contact information, billing details, communication preferences</li>
                    <li><strong>Staff Information:</strong> Employee records, roles, permissions, contact details</li>
                    <li><strong>System Data:</strong> Usage logs, performance metrics, security events</li>
                    <li><strong>Financial Data:</strong> Payment information, billing history, transaction records</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Provide and maintain our educational services</li>
                    <li>Process payments and manage subscriptions</li>
                    <li>Send important service notifications and updates</li>
                    <li>Improve system performance and user experience</li>
                    <li>Ensure security and prevent fraudulent activity</li>
                    <li>Comply with legal and regulatory requirements</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Student Privacy Protection</h3>
                  <p className="text-muted-foreground mb-3">
                    We are committed to protecting student privacy in accordance with FERPA, COPPA, and other applicable education privacy laws:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Student data is used solely for educational purposes</li>
                    <li>No advertising or marketing to students</li>
                    <li>Parental consent for data collection where required</li>
                    <li>Right to access, correct, or delete student information</li>
                    <li>Secure data handling and storage practices</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Security</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>AES-256 encryption for data at rest</li>
                    <li>TLS 1.3 encryption for data in transit</li>
                    <li>Multi-factor authentication for admin accounts</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Employee background checks and security training</li>
                    <li>Incident response procedures and breach notification</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Retention</h3>
                  <p className="text-muted-foreground">
                    We retain data only as long as necessary to provide services or as required by law. Student records are typically retained for 7 years after graduation or transfer. Financial records are kept for 7 years for tax and audit purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Right to access your personal information</li>
                    <li>Right to correct inaccurate data</li>
                    <li>Right to delete data (subject to legal requirements)</li>
                    <li>Right to data portability</li>
                    <li>Right to opt-out of non-essential communications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Data Export and Migration</h3>
                  <p className="text-muted-foreground mb-3">
                    We understand that data portability is important for educational institutions. We provide comprehensive data export capabilities:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Export Formats:</strong> CSV, Excel, JSON, and PDF formats available</li>
                    <li><strong>Data Categories:</strong> Student records, financial data, reports, and system configurations</li>
                    <li><strong>Export Frequency:</strong> On-demand exports or scheduled automated exports</li>
                    <li><strong>Migration Support:</strong> Assistance with data migration to other systems</li>
                    <li><strong>Data Validation:</strong> Export validation to ensure data integrity</li>
                    <li><strong>Retention Period:</strong> Export data available for 90 days post-cancellation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Third-Party Services and Integrations</h3>
                  <p className="text-muted-foreground mb-3">
                    Our platform may integrate with third-party services to enhance functionality. These integrations are subject to their own privacy policies:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Payment Processors:</strong> Secure payment processing through certified providers</li>
                    <li><strong>Communication Services:</strong> SMS and email services for notifications</li>
                    <li><strong>Analytics Services:</strong> Usage analytics to improve our services</li>
                    <li><strong>Cloud Storage:</strong> Secure cloud storage for data backup and redundancy</li>
                    <li><strong>Educational Tools:</strong> Integration with learning management systems and educational software</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    We carefully vet all third-party providers to ensure they meet our security and privacy standards. Data shared with third parties is limited to what is necessary for service functionality.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">International Data Transfers</h3>
                  <p className="text-muted-foreground mb-3">
                    Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
                    <li>Adequacy decisions where applicable</li>
                    <li>Data processing agreements with all service providers</li>
                    <li>Regular audits of international data handling practices</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Breach Notification</h3>
                  <p className="text-muted-foreground mb-3">
                    In the unlikely event of a data breach, we have comprehensive response procedures:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Immediate containment and assessment of the breach</li>
                    <li>Notification to affected users within 72 hours</li>
                    <li>Cooperation with relevant authorities and regulators</li>
                    <li>Detailed incident reports and remediation plans</li>
                    <li>Credit monitoring services for affected individuals when appropriate</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "updates":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Policy Updates and Changes</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Policy Modification Rights</h3>
                  <p className="text-muted-foreground mb-3">
                    Shule Track reserves the right to modify these Terms and Policies at any time. We will notify users of significant changes through:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Email notifications to registered users</li>
                    <li>In-app notifications and banners</li>
                    <li>Updates to our website and documentation</li>
                    <li>Direct communication for enterprise customers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Change Notification Timeline</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Minor Changes:</strong> 7 days advance notice for clarifications and minor updates</li>
                    <li><strong>Moderate Changes:</strong> 30 days advance notice for policy modifications</li>
                    <li><strong>Major Changes:</strong> 60 days advance notice for significant policy changes</li>
                    <li><strong>Emergency Changes:</strong> Immediate implementation for security or legal compliance</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Acceptance of Changes</h3>
                  <p className="text-muted-foreground mb-3">
                    Continued use of our services after policy changes constitutes acceptance of the new terms. If you do not agree with the changes, you may:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Cancel your subscription within the notice period</li>
                    <li>Contact us to discuss alternative arrangements</li>
                    <li>Request a data export before cancellation</li>
                    <li>Negotiate custom terms for enterprise customers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Version Control and History</h3>
                  <p className="text-muted-foreground mb-3">
                    We maintain a complete history of all policy changes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Versioned policy documents with change tracking</li>
                    <li>Detailed change logs with effective dates</li>
                    <li>Archive of previous policy versions</li>
                    <li>Summary of changes for each update</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Feedback and Suggestions</h3>
                  <p className="text-muted-foreground mb-3">
                    We welcome feedback on our policies and procedures:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Submit feedback through our support channels</li>
                    <li>Participate in user surveys and focus groups</li>
                    <li>Join our user advisory board (for enterprise customers)</li>
                    <li>Provide input during policy review periods</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Updates</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Enhanced data protection measures in compliance with new regulations</li>
                      <li>• Updated payment terms to include new payment methods</li>
                      <li>• Improved support response times and escalation procedures</li>
                      <li>• Added new data export formats and migration tools</li>
                      <li>• Clarified international data transfer procedures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Terms and Policies</h1>
              <p className="text-primary-foreground/80">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "secondary" : "ghost"}
                  className={`flex items-center gap-2 ${
                    activeSection === section.id
                      ? "bg-background text-foreground"
                      : "text-primary-foreground hover:bg-primary-foreground/20"
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <IconComponent className="h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have any questions about these Terms and Policies, please contact us:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-medium">General Support</p>
                <p className="text-sm text-muted-foreground">Email: support@shuletrack.com</p>
                <p className="text-sm text-muted-foreground">Phone: +254 113281424</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">General Information</p>
                <p className="text-sm text-muted-foreground">Email: info@shuletrack.com</p>
                <p className="text-sm text-muted-foreground">Phone: +254 113281424</p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-1">
              <p className="font-medium">Mailing Address</p>
              <p className="text-sm text-muted-foreground">
                Shule Track Education Technology<br />
                Gesora Road, Utawala<br />
                Nairobi, Kenya
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndPolicies;
