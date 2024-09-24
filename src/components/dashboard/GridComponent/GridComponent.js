import React from 'react';
import styles from './GridComponent.module.css';
import { Card, CardHeader } from '@nextui-org/react';
import { useRouter } from 'next/router';

export default function GridComponent(props) {
  const { records } = props;
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
  return (
    <div className={styles.GridComponent}>
      {records.map((record, i) => (
        <Card key={i} isPressable onPress={() => onSelect(record)}>
          <CardHeader className={styles.CardHeader}>
            <div className={styles.CardIcon}>{getInitials(record.name)}</div>
            <div className={styles.CardInfo}>
              <div className={styles.CardName}>{record.name}</div>
              <div className={styles.CardType}>Base</div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
