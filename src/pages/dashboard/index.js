import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';

function DashBoardScreen() {
  return (
    <>
      <Metaheader />
      <Layout>
        <div className="container mx-auto">
          <ul>
            <li>
              <a
                href="/api/admin/seed"
                target="_blank"
                style={{ color: '#fff', textDecoration: 'underline' }}
              >
                Seed
              </a>
            </li>
          </ul>
        </div>
      </Layout>
    </>
  );
}

DashBoardScreen.auth = true;
export default DashBoardScreen;
