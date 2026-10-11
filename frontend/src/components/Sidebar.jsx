import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Sliders,
  History,
  ShieldCheck,
} from 'lucide-react';
import { Logo } from './Logo';
import { TABS } from '../constants';

export const Sidebar = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: TABS.DASHBOARD, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: TABS.SINGLE_ASSESSMENT, label: 'Single Loan Assessment', icon: FileText },
    { id: TABS.BATCH_EVALUATION, label: 'Batch Loan Evaluation', icon: Layers },
    { id: TABS.THRESHOLD_SIMULATOR, label: 'Threshold Policy Simulator', icon: Sliders },
    { id: TABS.HISTORY, label: 'Audit Trail & History', icon: History },
    { id: TABS.MODEL_GOVERNANCE, label: 'Model Governance & Card', icon: ShieldCheck },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{
        padding: '20px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#FFFFFF'
      }}>
        <Logo size={36} />
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            CreditRisk AI
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontWeight: 400,
            marginTop: '2px'
          }}>
            Enterprise Loan Default Engine
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{
        padding: '20px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748B',
          padding: '0 10px 10px 10px',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Platform Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                color: isActive ? '#0066FF' : '#475569',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                width: '100%',
                border: 'none',
                borderLeft: isActive ? '3px solid #0066FF' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.color = '#0F172A';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#475569';
                }
              }}
            >
              <Icon
                size={18}
                color={isActive ? '#0066FF' : '#64748B'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span style={{ fontSize: '13.5px' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
