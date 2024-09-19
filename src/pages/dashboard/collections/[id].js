import React, { useEffect, useState } from 'react';
import Metaheader from '@/components/Metaheader';
import LayoutCollections from '@/components/LayoutCollections';
import { useRouter } from 'next/router';
import CollectionObjects from '@/components/CollectionObjects/CollectionsObjects';

async function getCollection(id) {
  if (!id) return;
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/get/?id=${id}`;
  return await fetch(url);
}

function CollectionsScreen() {
  const router = useRouter();
  const [collection, setCollection] = useState();
  useEffect(() => {
    const fetchCollection = async () => {
      if (!router.query.id) return;
      const resp = await getCollection(router.query.id);
      if (resp.ok) {
        const resp_json = await resp.json();
        if (resp_json && resp_json.data) {
          setCollection(resp_json.data.records[0]);
        }
      }
    };
    fetchCollection();
  }, [router.query.id]);
  return (
    <>
      <Metaheader title="Collections List | Vidashy" />
      <LayoutCollections collection={collection}>
        <CollectionObjects collection={collection} />
      </LayoutCollections>
    </>
  );
}

CollectionsScreen.auth = { adminOnly: true };
export default CollectionsScreen;
