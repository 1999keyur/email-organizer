import React from "react";
import { Collapse, Tag, Button } from "antd";
import "../styles/EmailList.css";

const { Panel } = Collapse;

export interface EmailData {
  domain: string;
  emails: string[];
}

export interface EmailListProps {
  data: EmailData[];
  selectable?: boolean;
  onEmailSelect?: (email: string, domain: string) => void;
  onEmailRemove?: (email: string, domain: string) => void;
  onDomainRemove?: (domain: string) => void;
  activeKey?: string;
  onCollapseChange?: (key: string | string[] | undefined) => void;
}

const EmailList: React.FC<EmailListProps> = ({
  data,
  selectable = false,
  onEmailSelect,
  onEmailRemove,
  onDomainRemove,
  activeKey,
  onCollapseChange,
}) => {
  return (
    <Collapse accordion activeKey={activeKey} onChange={onCollapseChange}>
      {data.map(({ domain, emails }) => (
        <Panel
          header={<span className="domain-header">{domain}</span>}
          key={domain}
          extra={
            !selectable &&
            onDomainRemove && (
              <Button
                size="small"
                type="link"
                onClick={(e) => {
                  e.stopPropagation();
                  onDomainRemove(domain);
                }}
              >
                Remove Domain
              </Button>
            )
          }
        >
          <div className="email-tag-container">
            {emails.map((email) => (
              <Tag
                key={email}
                closable={!selectable}
                onClose={(e) => {
                  e.preventDefault();
                  onEmailRemove && onEmailRemove(email, domain);
                }}
                onClick={() => {
                  if (selectable) {
                    onEmailSelect && onEmailSelect(email, domain);
                  }
                }}
                className="email-tag"
              >
                {email}
              </Tag>
            ))}
          </div>
        </Panel>
      ))}
    </Collapse>
  );
};

export default EmailList;
