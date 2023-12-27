import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';

function DashBoardScreen() {
  return (
    <>
      <Metaheader />
      <Layout></Layout>
    </>
  );
}

DashBoardScreen.auth = true;
export default DashBoardScreen;
