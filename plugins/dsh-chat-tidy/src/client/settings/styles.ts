export const SETTINGS_CSS = String.raw`
.dsh-tidy-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 580px;
  padding-bottom: 32px;
  color: var(--dsw-alias-label-primary, inherit);
  font-family: inherit;
}

.dsh-tidy-card {
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.2));
  border-radius: 12px;
  padding: 16px 18px;
  background: var(--dsw-alias-bg-card, rgba(128, 128, 128, 0.05));
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dsh-tidy-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, inherit);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dsh-tidy-desc {
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, rgba(128, 128, 128, 0.8));
}

.dsh-tidy-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
}

.dsh-tidy-row + .dsh-tidy-row {
  border-top: 1px solid var(--dsw-alias-border-l3, rgba(128, 128, 128, 0.1));
}

.dsh-tidy-row-info {
  flex: 1;
  min-width: 0;
}

.dsh-tidy-row-title {
  font-size: 13px;
  font-weight: 500;
}

.dsh-tidy-row-desc {
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, rgba(128, 128, 128, 0.7));
  margin-top: 2px;
  line-height: 1.4;
}

/* Switch */
.dsh-tidy-switch {
  position: relative;
  width: 38px;
  height: 22px;
  flex: none;
  cursor: pointer;
  border-radius: 999px;
  border: none;
  background: rgba(128, 128, 128, 0.3);
  transition: background 0.15s ease;
  padding: 0;
  outline: none;
}

.dsh-tidy-switch[aria-checked="true"] {
  background: #3b82f6;
}

.dsh-tidy-switch::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.dsh-tidy-switch[aria-checked="true"]::after {
  transform: translateX(16px);
}

/* Inputs */
.dsh-tidy-input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dsh-tidy-label {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dsh-tidy-input-row {
  display: flex;
  gap: 8px;
}

.dsh-tidy-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.25));
  background: var(--dsw-alias-bg-input, rgba(0, 0, 0, 0.05));
  color: inherit;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
}

.dsh-tidy-input:focus {
  border-color: #3b82f6;
}

.dsh-tidy-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
  background: transparent;
  color: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.dsh-tidy-btn:hover {
  background: rgba(128, 128, 128, 0.1);
  border-color: rgba(128, 128, 128, 0.5);
}

.dsh-tidy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dsh-tidy-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.dsh-tidy-badge-ok {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.dsh-tidy-badge-none {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

/* Priority list */
.dsh-tidy-priority-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dsh-tidy-priority-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(128, 128, 128, 0.06);
  border: 1px solid var(--dsw-alias-border-l3, rgba(128, 128, 128, 0.12));
}

.dsh-tidy-priority-name {
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dsh-tidy-order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
}

.dsh-tidy-btn-group {
  display: flex;
  gap: 4px;
}

.dsh-tidy-icon-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.2);
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
}

.dsh-tidy-icon-btn:hover:not(:disabled) {
  background: rgba(128, 128, 128, 0.15);
}

.dsh-tidy-icon-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* Slider / Select */
.dsh-tidy-select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
  background: var(--dsw-alias-bg-input, rgba(0, 0, 0, 0.05));
  color: inherit;
  font-size: 12px;
  outline: none;
}
`;
