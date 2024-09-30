import React, { useContext } from 'react';
import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import styles from '@/styles/Organizations.module.css';

export default function OrganizationScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <>
      <Metaheader title="Organization | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <div className={styles.Organizations}></div>
      </Layout>
    </>
  );
}
