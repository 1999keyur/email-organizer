import React from "react";
import { AutoComplete, Input } from "antd";
import "../styles/EmailInput.css";

export interface EmailInputProps {
  value: string;
  options: { value: string }[];
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  options,
  onChange,
  onSelect,
  onSearch,
  placeholder = "Enter email",
}) => {
  return (
    <AutoComplete
      style={{ width: "100%" }}
      options={options}
      value={value}
      onChange={onChange}
      onSelect={onSelect}
      placeholder={placeholder}
    >
      <Input.Search enterButton="Add" onSearch={onSearch} />
    </AutoComplete>
  );
};

export default EmailInput;
