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

                <div>
                  <h3 className="text-lg font-semibold mb-3">Cancellation</h3>
                  <p className="text-muted-foreground">
                    Subscriptions may be cancelled at any time with 30 days notice. Upon cancellation, you will retain access to the service until the end of your current billing period. Data export options are available for 90 days post-cancellation.
                  </p>
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
