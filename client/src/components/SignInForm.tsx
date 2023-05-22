import { Box, Button, TextInput, Title } from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

interface SignInFormProps {
  onSubmit: (credentials: { email: string; password: string }) => void;
}

const schema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

function SignInForm({ onSubmit }: SignInFormProps) {
  const navigate = useNavigate();
  const form = useForm({
    validate: yupResolver(schema),
    initialValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    form.reset();
  }, [form]);

  const handleSubmit = (values: { email: string; password: string }) => {
    onSubmit(values);
    form.reset();
    navigate('/dashboard');
  };

  return (
    <Box
      maw={300}
      mx="auto"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Box>
        <Title>Sign Up</Title>
      </Box>
      <form onSubmit={form.onSubmit(handleSubmit)} data-cy="signin-form">
        <TextInput
          withAsterisk
          label="Email"
          placeholder="example@example.com"
          {...form.getInputProps('email')}
          data-cy="signin-email"
          errorProps={{ 'data-cy': 'signin-email-error' }}
        />
        <TextInput
          withAsterisk
          type="password"
          label="Password"
          placeholder="********"
          {...form.getInputProps('password')}
          data-cy="signin-password"
          errorProps={{ 'data-cy': 'signin-password-error' }}
        />
        <Button
          type="submit"
          sx={{
            marginTop: '1rem',
          }}
        >
          Sign Up
        </Button>
      </form>
    </Box>
  );
}

export default SignInForm;
