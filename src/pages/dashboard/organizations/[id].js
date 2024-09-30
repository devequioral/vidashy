import React, { useContext } from 'react';
import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { AppContext } from '@/contexts/AppContext';
import styles from '@/styles/Organizations.module.css';

export default function OrganizationScreen() {
  const { state, dispatch } = useContext(AppContext);
  return (
    <>
      <Metaheader title="Organization | Vidashy" />
      <Layout theme={state.theme}>
        <div className={styles.Organizations}></div>
      </Layout>
    </>
  );
}
