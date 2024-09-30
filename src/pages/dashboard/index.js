import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { useContext, useEffect, useState } from 'react';
import GridComponent from '../../components/dashboard/GridComponent/GridComponent';
import styles from '@/styles/DashBoardScreen.module.css';
import { Button, Skeleton } from '@nextui-org/react';
import { HamburguerIcon } from '@virtel/icons';
import { GridIcon } from '../../components/Icons/GridIcon';
import LightTable from '../../components/dashboard/LigthTable/LightTable';
import { useRouter } from 'next/router';
import { AppContext } from '@/contexts/AppContext';

async function getListRecentCollectionsOpens() {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/recentopen/list`;
  return await fetch(url);
}

// const randomDate = () => {
//   const days = Number.parseInt(Math.random() * 10);
//   return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
// };

function DashBoardScreen() {
  const { state, dispatch } = useContext(AppContext);
  const [collections, setCollections] = useState([]);
  const [emptySpace, setEmptySpace] = useState(false);
  const [view, setView] = useState('grid');
  const router = useRouter();
  const fetchRecentCollections = async () => {
    const resp = await getListRecentCollectionsOpens();
    if (resp.ok) {
      const resp_json = await resp.json();
      const records = resp_json.data.records;
      const _collections = [];
      console.log(records);
      records.map((record, i) => {
        _collections.push({
          name: record.collection_name,
          id: record.collection_id,
          type: 'Collection',
          organization: record.organization_name,
          date: record.date,
        });
      });
      setCollections(_collections);
    } else {
      setEmptySpace(true);
    }
  };
  useEffect(() => {
    fetchRecentCollections();
  }, []);
  return (
    <>
      <Metaheader />
      <Layout theme={state.theme}>
        <div className={styles.DashBoardScreen}>
          <div className={styles.Header}>
            <h1>Home</h1>
          </div>
          {!emptySpace && (
            <div className={styles.Collections}>
              {collections.length > 0 && (
                <div className={styles.Filter}>
                  <p>Last Collections opens</p>
                  <div className={styles.ChangeView}>
                    <Button
                      isIconOnly
                      variant={view === 'table' ? 'solid' : 'link'}
                      size="sm"
                      onPress={() => setView('table')}
                    >
                      <HamburguerIcon fill={'black'} size={18} />
                    </Button>
                    <Button
                      isIconOnly
                      variant={view === 'grid' ? 'solid' : 'link'}
                      size="sm"
                      onPress={() => setView('grid')}
                    >
                      <GridIcon fill={'black'} size={18} />
                    </Button>
                  </div>
                </div>
              )}
              {view === 'table' && (
                <div className={styles.Table}>
                  <LightTable
                    records={collections}
                    orderByDate={true}
                    onSelectRecord={(record) => {
                      router.push(`/dashboard/collections/${record.id}`);
                    }}
                  />
                </div>
              )}
              {view === 'grid' && (
                <div className={styles.Grid}>
                  {collections && (
                    <GridComponent records={collections} orderByDate={true} />
                  )}
                </div>
              )}
              {collections.length === 0 && (
                <Skeleton className={styles.Skeleton} />
              )}
            </div>
          )}
          {emptySpace && (
            <div className={styles.EmptySpace}>
              <h3>Don't Have Collections Yet</h3>
              <p>Collections will appear here after creating theme</p>
              <Button color="primary">Create a New Collection</Button>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

DashBoardScreen.auth = true;
export default DashBoardScreen;
