import Image from 'next/image';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { getError } from '@/utils/error';
import { Input } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Checkbox } from '@nextui-org/react';

const EyeSlashFilledIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M21.2714 9.17834C20.9814 8.71834 20.6714 8.28834 20.3514 7.88834C19.9814 7.41834 19.2814 7.37834 18.8614 7.79834L15.8614 10.7983C16.0814 11.4583 16.1214 12.2183 15.9214 13.0083C15.5714 14.4183 14.4314 15.5583 13.0214 15.9083C12.2314 16.1083 11.4714 16.0683 10.8114 15.8483C10.8114 15.8483 9.38141 17.2783 8.35141 18.3083C7.85141 18.8083 8.01141 19.6883 8.68141 19.9483C9.75141 20.3583 10.8614 20.5683 12.0014 20.5683C13.7814 20.5683 15.5114 20.0483 17.0914 19.0783C18.7014 18.0783 20.1514 16.6083 21.3214 14.7383C22.2714 13.2283 22.2214 10.6883 21.2714 9.17834Z"
      fill="currentColor"
    />
    <path
      d="M14.0206 9.98062L9.98062 14.0206C9.47062 13.5006 9.14062 12.7806 9.14062 12.0006C9.14062 10.4306 10.4206 9.14062 12.0006 9.14062C12.7806 9.14062 13.5006 9.47062 14.0206 9.98062Z"
      fill="currentColor"
    />
    <path
      d="M18.25 5.74969L14.86 9.13969C14.13 8.39969 13.12 7.95969 12 7.95969C9.76 7.95969 7.96 9.76969 7.96 11.9997C7.96 13.1197 8.41 14.1297 9.14 14.8597L5.76 18.2497H5.75C4.64 17.3497 3.62 16.1997 2.75 14.8397C1.75 13.2697 1.75 10.7197 2.75 9.14969C3.91 7.32969 5.33 5.89969 6.91 4.91969C8.49 3.95969 10.22 3.42969 12 3.42969C14.23 3.42969 16.39 4.24969 18.25 5.74969Z"
      fill="currentColor"
    />
    <path
      d="M14.8581 11.9981C14.8581 13.5681 13.5781 14.8581 11.9981 14.8581C11.9381 14.8581 11.8881 14.8581 11.8281 14.8381L14.8381 11.8281C14.8581 11.8881 14.8581 11.9381 14.8581 11.9981Z"
      fill="currentColor"
    />
    <path
      d="M21.7689 2.22891C21.4689 1.92891 20.9789 1.92891 20.6789 2.22891L2.22891 20.6889C1.92891 20.9889 1.92891 21.4789 2.22891 21.7789C2.37891 21.9189 2.56891 21.9989 2.76891 21.9989C2.96891 21.9989 3.15891 21.9189 3.30891 21.7689L21.7689 3.30891C22.0789 3.00891 22.0789 2.52891 21.7689 2.22891Z"
      fill="currentColor"
    />
  </svg>
);

const EyeFilledIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M21.25 9.14969C18.94 5.51969 15.56 3.42969 12 3.42969C10.22 3.42969 8.49 3.94969 6.91 4.91969C5.33 5.89969 3.91 7.32969 2.75 9.14969C1.75 10.7197 1.75 13.2697 2.75 14.8397C5.06 18.4797 8.44 20.5597 12 20.5597C13.78 20.5597 15.51 20.0397 17.09 19.0697C18.67 18.0897 20.09 16.6597 21.25 14.8397C22.25 13.2797 22.25 10.7197 21.25 9.14969ZM12 16.0397C9.76 16.0397 7.96 14.2297 7.96 11.9997C7.96 9.76969 9.76 7.95969 12 7.95969C14.24 7.95969 16.04 9.76969 16.04 11.9997C16.04 14.2297 14.24 16.0397 12 16.0397Z"
      fill="currentColor"
    />
    <path
      d="M11.9984 9.14062C10.4284 9.14062 9.14844 10.4206 9.14844 12.0006C9.14844 13.5706 10.4284 14.8506 11.9984 14.8506C13.5684 14.8506 14.8584 13.5706 14.8584 12.0006C14.8584 10.4306 13.5684 9.14062 11.9984 9.14062Z"
      fill="currentColor"
    />
  </svg>
);

function LoginForm(props) {
  const { options } = props;
  const { data: session } = useSession();

  const router = useRouter();
  const { redirect } = router.query;

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || '/dashboard');
    }
  }, [router, session, redirect]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();

  const _handleSubmit = async ({ username, password }) => {
    if (isSubmitting) return;

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });
      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const [paswwordVisible, setPaswwordVisible] = React.useState(false);

  const toggleVisibility = () => setPaswwordVisible(!paswwordVisible);
  return (
    <form className="main-container" onSubmit={handleSubmit(_handleSubmit)}>
      {options?.logo && (
        <header className="header">
          <Image
            src={options.logo.src}
            width={options.logo.width}
            height={options.logo.height}
            alt={options.logo.alt}
          />
        </header>
      )}
      <div className="form-group">
        <Input
          id="username"
          isRequired
          type="text"
          label="Usuario"
          ariaLabel="Username"
          variant="bordered"
          placeholder="Username / Email"
          isInvalid={errors.username}
          errorMessage={errors.username && errors.username.message}
          className="max-w-xs"
          {...register('username', {
            required: 'This Field is Required',
            minLength: {
              value: 3,
              message: 'Min length is 3',
            },
            maxLength: {
              value: 300,
              message: 'Max length is 300',
            },
          })}
        />
      </div>
      <div className="form-group">
        <Input
          label="Password"
          isRequired
          variant="bordered"
          placeholder="Ingrese su Password"
          isInvalid={errors.password}
          errorMessage={errors.password && errors.password.message}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {paswwordVisible ? (
                <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              ) : (
                <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
              )}
            </button>
          }
          type={paswwordVisible ? 'text' : 'password'}
          className="max-w-xs"
          {...register('password', {
            required: 'This Field is Required',
            minLength: {
              value: 3,
              message: 'Min length is 3',
            },
            maxLength: {
              value: 300,
              message: 'Max length is 300',
            },
          })}
        />
      </div>
      <Button
        type="sumbit"
        color="primary"
        variant="shadow"
        style={{ width: '100%', marginTop: '20px' }}
      >
        Entrar
      </Button>
      <p className="terms-message">
        Al Ingresar a nuestra plataforma usted está de acuerdo a nuestros{' '}
        <a
          href="#"
          className="terms-link"
          style={{ textDecorationLine: 'underline', color: '#228ece' }}
          aria-label="Terms and conditions"
        >
          términos y condiciones
        </a>
      </p>
      <div className="remember-me-group">
        <Checkbox size="sm" radius="none">
          Recordar mis datos
        </Checkbox>
      </div>
      <style jsx>{`
        .main-container {
          align-items: center;
          border-radius: 10px;
          background-color: #fff;
          display: flex;
          max-width: 294px;
          flex-direction: column;
          margin: 0 auto;
          padding: 30px 24px;
        }

        .header {
          padding: 10px;
          margin-bottom: 20px;
          text-align: center;
        }

        .header-logo {
          aspect-ratio: 4.28;
          object-fit: contain;
          object-position: center;
          width: 244px;
          max-width: 244px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          margin-top: 20px;
          width: 100%;
        }

        .form-label {
          color: rgba(0, 0, 0, 0.6);
          letter-spacing: 0.15px;
          font: 400 16px/144% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }

        .form-input {
          padding: 10px;
        }

        .form-error {
          color: rgba(244, 11, 11, 0.6);
          letter-spacing: 0.15px;
          font: 400 12px/144% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
          align-self: start;
        }

        .terms-message {
          letter-spacing: 0.4px;
          align-self: stretch;
          margin-top: 18px;
          font: 400 10px/12px Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }

        .terms-link {
          color: #228ece;
        }

        .remember-me-group {
          align-self: stretch;
          flex-direction: row;
          margin-top: 12px;
          justify-content: flex-start;
          align-items: center;
          display: flex;
          gap: 10px;
        }

        .remember-me-label {
          color: rgba(0, 0, 0, 0.62);
          letter-spacing: 0.4px;
          margin: auto 0;
          font: 400 10px/120% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }

        .checkbox {
          border: 1px solid rgba(0, 0, 0, 0.6);
          width: 14px;
          height: 13px;
          align-self: stretch;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </form>
  );
}

export default LoginForm;
