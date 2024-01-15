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
        {/* <form
          action="/api/v1/media"
          method="post"
          enctype="multipart/form-data"
          style={{ marginTop: '50px' }}
        >
          <input type="file" name="file" />
          <button
            type="submit"
            style={{ color: '#fff', background: 'blue', padding: '10px' }}
          >
            Submit
          </button>
        </form> */}
      </Layout>
    </>
  );
}

DashBoardScreen.auth = true;
export default DashBoardScreen;
