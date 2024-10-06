import React, { useEffect, useState } from 'react';
import styles from './GridComponent.module.css';
import { Card, CardHeader } from '@nextui-org/react';
import { useRouter } from 'next/router';

export default function GridComponent(props) {
  const { records, orderByDate } = props;
  const [sections, setSections] = useState([]);
  const router = useRouter();
  const getInitials = (name) => {
    if (!name || name.length < 2) {
      return 'Un';
    }
    return name.substring(0, 2);
  };
  const onSelect = (record) => {
    router.push(`/dashboard/collections/${record.id}`);
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
    <div className={styles.GridComponent}>
      {sections.map((section) => {
        return (
          section.records.length > 0 && (
            <div className={styles.Section} key={section.key}>
              {section.label && (
                <h3 className={styles.Label}>{section.label}</h3>
              )}
              <div className={styles.Cards}>
                {section.records.map((record, i) => (
                  <Card key={i} isPressable onPress={() => onSelect(record)}>
                    <CardHeader className={styles.CardHeader}>
                      <div className={styles.CardIcon}>
                        {getInitials(record.name)}
                      </div>
                      <div className={styles.CardInfo}>
                        <div className={styles.CardName}>{record.name}</div>
                        <div className={styles.CardType}>{record.type}</div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )
        );
      })}
    </div>
  );
}
