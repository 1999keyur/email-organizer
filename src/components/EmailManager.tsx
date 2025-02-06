import React, { useState, useEffect } from "react";
import { Button, Row, Col, Card } from "antd";
import EmailList, { EmailData } from "./EmailList";
import EmailInput from "./EmailInput";
import "../styles/EmailManager.css";

const STORAGE_AVAILABLE_KEY = "availableEmails";
const STORAGE_SELECTED_KEY = "selectedEmails";
const TTL_ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

const setItemWithExpiry = (key: string, value: any, ttl: number) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

const getItemWithExpiry = (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};

const EmailManager: React.FC = () => {
  const defaultAvailableEmails: EmailData[] = [
    { domain: "gmail.com", emails: ["user1@gmail.com", "user2@gmail.com"] },
    { domain: "yahoo.com", emails: ["user3@yahoo.com"] },
  ];

  const [availableEmails, setAvailableEmails] = useState<EmailData[]>(() => {
    const stored = getItemWithExpiry(STORAGE_AVAILABLE_KEY);
    return stored ? stored : defaultAvailableEmails;
  });
  const [selectedEmails, setSelectedEmails] = useState<EmailData[]>(() => {
    const stored = getItemWithExpiry(STORAGE_SELECTED_KEY);
    return stored ? stored : [];
  });

  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const [emailError, setEmailError] = useState<string>("");
  const [activeAvailablePanel, setActiveAvailablePanel] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    setItemWithExpiry(STORAGE_AVAILABLE_KEY, availableEmails, TTL_ONE_WEEK);
  }, [availableEmails]);

  useEffect(() => {
    setItemWithExpiry(STORAGE_SELECTED_KEY, selectedEmails, TTL_ONE_WEEK);
  }, [selectedEmails]);

  const handleEmailSelect = (email: string, domain: string) => {
    setAvailableEmails((prev) =>
      prev
        .map((item) =>
          item.domain === domain
            ? { ...item, emails: item.emails.filter((e) => e !== email) }
            : item
        )
        .filter((item) => item.emails.length > 0)
    );
    setSelectedEmails((prev) => {
      const existing = prev.find((item) => item.domain === domain);
      if (existing) {
        return prev.map((item) =>
          item.domain === domain
            ? { ...item, emails: [...item.emails, email] }
            : item
        );
      }
      return [...prev, { domain, emails: [email] }];
    });
  };

  const handleEmailRemove = (email: string, domain: string) => {
    setSelectedEmails((prev) =>
      prev
        .map((item) =>
          item.domain === domain
            ? { ...item, emails: item.emails.filter((e) => e !== email) }
            : item
        )
        .filter((item) => item.emails.length > 0)
    );
    setAvailableEmails((prev) => {
      const existing = prev.find((item) => item.domain === domain);
      if (existing) {
        if (!existing.emails.includes(email)) {
          return prev.map((item) =>
            item.domain === domain
              ? { ...item, emails: [...item.emails, email] }
              : item
          );
        }
        return prev;
      }
      return [...prev, { domain, emails: [email] }];
    });
  };

  const handleDomainRemove = (domain: string) => {
    const domainData = selectedEmails.find((item) => item.domain === domain);
    if (!domainData) return;
    setSelectedEmails((prev) => prev.filter((item) => item.domain !== domain));
    setAvailableEmails((prev) => {
      const existing = prev.find((item) => item.domain === domain);
      if (existing) {
        return prev.map((item) =>
          item.domain === domain
            ? { ...item, emails: [...item.emails, ...domainData.emails] }
            : item
        );
      }
      return [...prev, { domain, emails: domainData.emails }];
    });
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setEmailError("");
    const atIndex = value.indexOf("@");
    if (atIndex !== -1) {
      const typedDomain = value.slice(atIndex + 1).toLowerCase();
      const domainsFromAvailable = availableEmails.map((item) => item.domain);
      const domainsFromSelected = selectedEmails.map((item) => item.domain);
      const combinedDomains = Array.from(
        new Set([...domainsFromAvailable, ...domainsFromSelected])
      );
      const filtered = combinedDomains.filter((d) => d.includes(typedDomain));
      setOptions(
        filtered.map((d) => ({ value: value.slice(0, atIndex + 1) + d }))
      );
    } else {
      setOptions([]);
    }
  };

  const handleSelect = (value: string) => {
    setInputValue(value);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmailSubmit = () => {
    if (!isValidEmail(inputValue)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    const [localPart, domain] = inputValue.split("@");
    if (!localPart || !domain) return;
    setAvailableEmails((prev) => {
      const existing = prev.find((item) => item.domain === domain);
      if (existing) {
        if (!existing.emails.includes(inputValue)) {
          return prev.map((item) =>
            item.domain === domain
              ? { ...item, emails: [...item.emails, inputValue] }
              : item
          );
        }
        return prev;
      }
      return [...prev, { domain, emails: [inputValue] }];
    });
    setActiveAvailablePanel(domain);
    setInputValue("");
    setOptions([]);
    setEmailError("");
  };

  const handleSendEmail = () => {
    const allSelectedEmails = selectedEmails.flatMap((item) => item.emails);
    if (allSelectedEmails.length === 0) return;
    const mailtoLink = `mailto:${allSelectedEmails.join(",")}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="email-manager-container">
      <div className="email-cards">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Available Emails" className="email-card">
              <EmailInput
                value={inputValue}
                options={options}
                onChange={handleInputChange}
                onSelect={handleSelect}
                onSearch={handleAddEmailSubmit}
              />
              {/* Inline error message displayed in red */}
              {emailError && <div className="error-message">{emailError}</div>}
              <div className="email-list-container">
                <EmailList
                  data={availableEmails}
                  selectable
                  onEmailSelect={handleEmailSelect}
                  activeKey={activeAvailablePanel}
                  onCollapseChange={(key) =>
                    setActiveAvailablePanel(key as string)
                  }
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Selected Emails" className="email-card">
              <div className="email-list-container">
                <EmailList
                  data={selectedEmails}
                  selectable={false}
                  onEmailRemove={handleEmailRemove}
                  onDomainRemove={handleDomainRemove}
                />
              </div>
              <Button
                disabled={selectedEmails.length <= 0}
                type="primary"
                block
                onClick={handleSendEmail}
                className="send-button"
              >
                Send Email
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EmailManager;
