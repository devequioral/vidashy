import React, { useEffect, useState } from 'react';
import styles from './LightTable.module.css';

export default function LightTable(props) {
  const { records, orderByDate, onSelectRecord } = props;
  const [sections, setSections] = useState([]);
  const getInitials = (name) => {
    if (!name || name.length < 2) {
      return 'Un';
    }
    return name.substring(0, 2);
  };
  const onSelect = (record) => {
    if (onSelectRecord) {
      onSelectRecord(record);
    }
  };
  useEffect(() => {
    if (!records) return;
    if (!orderByDate) {
      const _sections = [];
      _sections.push({ key: 'today', records });
      setSections(_sections);
    } else {
      const _sections = [
        { key: 'today', label: 'Today', records: [] },
        { key: 'sevendays', label: 'Last 7 days', records: [] },
        { key: 'thirtydays', label: 'Last 30 days', records: [] },
        { key: 'before', label: 'Before', records: [] },
      ];
      records.map((record) => {
        const timeRecord = new Date(record.date).getTime();
        const now = Date.now();
        const day_ms = 24 * 60 * 60 * 1000;
        if (now - timeRecord < day_ms) _sections[0].records.push(record);
        else if (now - timeRecord < 7 * day_ms)
          _sections[1].records.push(record);
        else if (now - timeRecord < 30 * day_ms)
          _sections[2].records.push(record);
        else _sections[3].records.push(record);
      });
      setSections(_sections);
    }
  }, [records]);
  return (
    <div className={styles.LightTable}>
      <div className={styles.Header}>
        <div className={styles.NameHeader}>Name</div>
        <div className={styles.TypeHeader}>Type</div>
        <div className={styles.OrganizationHeader}>Organization</div>
      </div>
      <div className={styles.Body}>
        {sections.map((section) => {
          return (
            section.records.length > 0 && (
              <div className={styles.Section} key={section.key}>
                {section.label && (
                  <h3 className={styles.Label}>{section.label}</h3>
                )}
                <div className={styles.Records}>
                  {section.records.map((record, i) => (
                    <div className={styles.Record} key={i}>
                      <div
                        className={styles.NameRecord}
                        onClick={() => onSelect(record)}
                      >
                        <div className={styles.RecordIcon}>
                          {getInitials(record.name)}
                        </div>
                        {record.name}
                      </div>
                      <div className={styles.TypeRecord}>{record.type}</div>
                      <div className={styles.OrganizationRecord}>
                        {record.organization}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
}
