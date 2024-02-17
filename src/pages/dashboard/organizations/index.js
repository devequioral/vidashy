import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import TableComponent from '@/components/dashboard/TableComponent';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import { Chip } from '@nextui-org/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatDate, capitalizeFirstLetter } from '@/utils/utils';
import Image from 'next/image';
import ModalComponent from '@/components/dashboard/ModalComponent';
import organizationModel from '@/models/organizationModel';
import { toast } from 'react-toastify';
import DetailRecord from '@/components/dashboard/DetailRecord';
import MediaUpload from '@/components/dashboard/MediaUpload';

async function getProducts(page = 1, pageSize = 5, status = 'all') {
  //SIMULATE SLOW CONNECTION
  //await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/list?page=${page}&pageSize=${pageSize}&status=${status}`
  );
  return await res.json();
}

function ListOrganizations() {
  const [products, setProducts] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [refreshTable, setRefreshTable] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { status } = router.query;
  const [showModalProductDetail, setShowModalProductDetail] = React.useState(0);
  const [showModalChangeImage, setShowModalChangeImage] = React.useState(0);

  const [recordModal, setRecordModal] = React.useState(organizationModel);
  const [recordChange, setRecordChange] = React.useState(false);
  const [allowUploadImage, setAllowUploadImage] = React.useState(false);
  const [recordImage, setRecordImage] = React.useState(null);
  const [savingRecord, setSavingRecord] = React.useState(false);
  const [savingImage, setSavingImage] = React.useState(false);
  const [validation, setValidation] = React.useState({});

  const onRecordChange = (value) => {
    setRecordChange(value);
  };

  const onFieldChange = (key, value) => {
    const newRecord = { ...recordModal };
    newRecord[key] = value;
    setRecordModal(newRecord);
    setRecordChange(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchOrders = async () => {
        setLoading(true);
        const productsBD = await getProducts(page, pageSize, status);

        if (
          productsBD &&
          productsBD.products &&
          productsBD.products.records &&
          productsBD.products.records.length > 0
        ) {
          setProducts(
            productsBD.products.records.map((product, index) => {
              return {
                ...product,
                key: index,
                id: product.id,
                productName: product.productName,
                date: product.createdAt,
                status: product.status,
              };
            })
          );
          setTotalPages(productsBD.products.totalPages);
          setPage(productsBD.products.page);
        } else {
          setProducts([]);
          setTotalPages(1);
          setPage(1);
        }
        setLoading(false);
      };
      fetchOrders(page, pageSize);
    }
  }, [page, pageSize, status, refreshTable]);

  const { theme, toggleTheme } = useContext(ThemeContext);

  const showProductDetail = (record) => {
    setRecordModal(record);
    setShowModalProductDetail((currCount) => currCount + 1);
  };

  const onNewProduct = () => {
    setRecordModal(productModel);
    setShowModalProductDetail((currCount) => currCount + 1);
  };

  const showChangeImage = (image) => {
    setShowModalChangeImage((currCount) => currCount + 1);
  };

  const saveProduct = async () => {
    if (savingRecord) return;
    setSavingRecord(true);
    const url = recordModal.id
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/update`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/new`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product_request: recordModal }),
    });

    if (response.ok) {
      toast.success('Producto Guardado con éxito');
      setShowModalProductDetail(0);
      setRefreshTable((currCount) => currCount + 1);
      setSavingRecord(false);
    } else {
      const { message, validation } = await response.json();
      if (validation) setValidation(validation);
      //toast.error(message);
      setSavingRecord(false);
    }
  };

  const uploadImage = async () => {
    if (savingImage) return;
    setSavingImage(true);
    const body = new FormData();
    body.append('file', recordImage);
    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + '/api/admin/media/upload',
      {
        method: 'POST',
        body,
      }
    );

    if (response.ok) {
      const { url, fields, mediaKey, urlMedia } = await response.json();
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', recordImage);

      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        //toast.success('Imágen Guardada con éxito');
        const newRecord = { ...recordModal };
        newRecord.productImage.src = urlMedia;
        setRecordModal(newRecord);
        setRecordChange(true);
      } else {
        toast.error('La imágen no se pudo guardar');
      }
      setShowModalChangeImage(0);
      setSavingImage(false);
    } else {
      setSavingImage(false);
    }
  };

  const renderCell = React.useCallback((record, columnKey) => {
    const cellValue = record[columnKey];
    switch (columnKey) {
      case 'expand':
        return (
          <div
            className="expand-cell"
            onClick={() => {
              showProductDetail(record);
            }}
          >
            <Image
              src="/assets/images/icon-expand.svg"
              width={12}
              height={12}
              alt=""
            />
          </div>
        );
      case 'status':
        const statusColorMap = {
          disponible: 'success',
          agotado: 'danger',
        };
        return (
          <>
            {cellValue ? (
              <Chip
                className="capitalize"
                color={statusColorMap[record.status]}
                size="sm"
                variant="flat"
              >
                {capitalizeFirstLetter(cellValue)}
              </Chip>
            ) : (
              <div></div>
            )}
          </>
        );

      case 'date':
        return <div>{formatDate(cellValue)}</div>;

      case 'id':
        return (
          <div
            style={{
              textDecoration: 'none',
              color: '#0070f0',
              cursor: 'pointer',
            }}
            onClick={() => {
              showProductDetail(record);
            }}
          >
            {cellValue}
          </div>
        );

      default:
        return cellValue;
    }
  }, []);
  return (
    <>
      <Metaheader title="List Organizations | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Home' },
              { href: false, title: 'Organizations' },
            ],
          }}
        />
        <TableComponent
          data={{
            title: 'Listado de Productos',
            button: {
              label: 'Nuevo Producto',
              callback: () => {
                onNewProduct();
              },
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Product ID' },
              { key: 'productName', label: 'Producto' },
              { key: 'date', label: 'Fecha' },
              { key: 'status', label: 'Status' },
            ],
            rows: products,
            pagination: {
              total: totalPages,
              initialPage: page,
              isDisabled: loading,
              onChange: (page) => {
                setPage(page);
              },
            },
            renderCell,
          }}
        />
        <ModalComponent
          show={showModalProductDetail}
          onSave={saveProduct}
          title="Detalle de Producto"
          onCloseModal={() => {
            onRecordChange(false);
          }}
          allowSave={recordChange}
          savingRecord={savingRecord}
        >
          <DetailRecord
            onRecordChange={(value) => {
              onRecordChange(value);
            }}
            record={recordModal}
            onFieldChange={(key, value) => {
              onFieldChange(key, value);
            }}
            onChangeImage={(image) => {
              showChangeImage(image);
            }}
            validation={validation}
            schema={{
              title: 'Detalle de Producto',
              fields: [
                {
                  key: 'id',
                  label: 'Product ID',
                  type: 'hidden',
                },
                {
                  key: 'productName',
                  label: 'Nombre del Producto',
                  type: 'text',
                  isRequired: true,
                },
                {
                  key: 'description',
                  label: 'Descripción',
                  type: 'text',
                  isRequired: true,
                },
                {
                  key: 'productImage',
                  label: 'Imágen',
                  type: 'image',
                  preview: true,
                },
                {
                  key: 'status',
                  label: 'Status',
                  type: 'select',
                  isRequired: true,
                  items: [
                    { value: 'disponible', label: 'Disponible' },
                    { value: 'agotado', label: 'Agotado' },
                  ],
                },
              ],
            }}
          />
        </ModalComponent>
        <ModalComponent
          show={showModalChangeImage}
          onSave={uploadImage}
          title="Cambiar Imágen"
          onCloseModal={() => {
            setAllowUploadImage(false);
          }}
          allowSave={allowUploadImage}
          savingRecord={savingImage}
        >
          <MediaUpload
            onImageChange={(image) => {
              setRecordImage(image);
              setAllowUploadImage(true);
            }}
          />
        </ModalComponent>
      </Layout>
    </>
  );
}

ListOrganizations.auth = { adminOnly: true };
export default ListOrganizations;
