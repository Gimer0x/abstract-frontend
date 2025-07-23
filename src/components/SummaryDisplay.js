import React, { useState } from 'react';
import './SummaryDisplay.css';

const SummaryDisplay = ({ summaryData, originalFilename }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      const textToCopy = formatSummaryForCopy(summaryData, originalFilename);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatSummaryForCopy = (data, filename) => {
    let text = `DOCUMENT SUMMARY\n`;
    text += `Original Document: ${filename}\n\n`;
    
    if (data.executiveSummary) {
      text += `EXECUTIVE SUMMARY:\n${data.executiveSummary}\n\n`;
    }
    
    if (data.keyPoints && data.keyPoints.length > 0) {
      text += `KEY POINTS:\n${data.keyPoints.map(point => `• ${point}`).join('\n')}\n\n`;
    }
    
    if (data.actionItems && data.actionItems.length > 0) {
      text += `ACTION ITEMS:\n${data.actionItems.map(item => `• ${item}`).join('\n')}\n\n`;
    }
    
    if (data.importantDates && data.importantDates.length > 0) {
      text += `IMPORTANT DATES:\n${data.importantDates.map(date => `• ${date}`).join('\n')}\n\n`;
    }
    
    if (data.relevantNames && data.relevantNames.length > 0) {
      text += `RELEVANT NAMES:\n${data.relevantNames.map(name => `• ${name}`).join('\n')}\n\n`;
    }
    
    if (data.places && data.places.length > 0) {
      text += `PLACES:\n${data.places.map(place => `• ${place}`).join('\n')}\n\n`;
    }
    
    text += `Generated on: ${new Date().toLocaleString()}`;
    return text;
  };

  const renderSection = (title, items, icon) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="summary-section">
        <h3 className="section-title">
          <span className="section-icon">{icon}</span>
          {title}
        </h3>
        <ul className="section-list">
          {items.map((item, index) => (
            <li key={index} className="section-item">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="summary-display">
      <div className="summary-header">
        <h2>Document Summary</h2>
        <div className="summary-meta">
          <span className="filename">Original: {originalFilename}</span>
          <button 
            className={`copy-button ${copied ? 'copied' : ''}`}
            onClick={copyToClipboard}
            title="Copy summary to clipboard"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      <div className="summary-content">
        {summaryData.executiveSummary && (
          <div className="summary-section executive-summary">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              Executive Summary
            </h3>
            <div className="summary-text">
              {summaryData.executiveSummary}
            </div>
          </div>
        )}

        {renderSection('Key Points', summaryData.keyPoints, '🎯')}
        {renderSection('Action Items', summaryData.actionItems, '✅')}
        {renderSection('Important Dates', summaryData.importantDates, '📅')}
        {renderSection('Relevant Names', summaryData.relevantNames, '👥')}
        {renderSection('Places', summaryData.places, '📍')}
      </div>

      <div className="summary-footer">
        <p>Generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default SummaryDisplay; 