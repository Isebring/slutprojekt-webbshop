import {
  Box,
  Button,
  Group,
  Notification,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { IconX } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Yup from 'yup';
import { ProductContext } from '../contexts/ProductContext';
import { useShoppingCart } from '../contexts/UseShoppingCartContext';
import { useUser } from '../contexts/UseUserContext';
import OrderModal from './OrderModal';

export interface FormValues {
  fullName: string;
  email: string;
  address: string;
  zipCode: string;
  phoneNumber: string;
  city: string;
}

const schema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Name should have at least 2 letters')
    .required('This field is required'),
  email: Yup.string()
    .email('Invalid email')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email')
    .required('Email is required'),
  address: Yup.string()
    .min(2, 'Your address should have at least 2 letters')
    .required('This field is required'),
  zipCode: Yup.string()
    .min(5, 'this field should be 5 numbers long')
    .max(5, 'this field should be 5 numbers long')
    .required('This field is required'),
  phoneNumber: Yup.string()
    .min(10, 'Your phone nr should be 10 numbers long')
    .max(10, 'Your phone nr should be 10 numbers long')
    .required('This field is required'),
  city: Yup.string()
    .min(2, 'Name should have at least 2 letters')
    .max(50, 'This field is too big')
    .required('This field is required'),
});

function CheckoutForm() {
  const navigate = useNavigate();
  const { createOrder, cartItems } = useShoppingCart();
  const [showModal, setShowModal] = useState(false);
  const user = useUser();
  const { getProductById } = useContext(ProductContext);
  const [showNotification, setShowNotification] = useState(false);
  const [invalidItems, setInvalidItems] = useState<unknown[]>([]);

  function closeNotification() {
    setShowNotification(false);
  }

  const onSubmit = async (data: FormValues) => {
    const newInvalidItems = [];

    for (const item of cartItems) {
      const product = await getProductById(item._id);
      if (product && item.quantity > product.stock) {
        newInvalidItems.push(item);
      }
    }

    setInvalidItems(newInvalidItems);

    if (newInvalidItems.length > 0) {
      setShowNotification(true);
      return;
    }
    if (user) {
      try {
        const order = await createOrder(cartItems, data);
        if (order) {
          navigate('/confirmation');
        } else {
          // Handle error case
          console.log('Error occurred while placing the order');
        }
      } catch (error) {
        // Handle error case
        console.log(error);
      }
    } else {
      // User is not logged in, show the login modal
      setShowModal(true);
    }
  };

  const form = useForm<FormValues>({
    validate: yupResolver(schema),
    initialValues: {
      fullName: '',
      email: '',
      address: '',
      zipCode: '',
      phoneNumber: '',
      city: '',
    },
  });

  return (
    <Box
      sx={{
        width: '22rem',
        '@media(max-width:721px)': {
          flexDirection: 'column',
          width: '20rem',
        },
      }}
    >
      <OrderModal opened={showModal} onClose={() => setShowModal(false)} />
      <Title mb="sm" order={3}>
        Your details
      </Title>
      {showNotification && (
        <Notification
          onClose={closeNotification}
          icon={<IconX size="1.1rem" />}
          color="red"
        >
          {`Sorry, you have added more products than the current stock for ${invalidItems.length} item(s).`}
        </Notification>
      )}
      <form onSubmit={form.onSubmit(onSubmit)} data-cy="customer-form">
        <TextInput
          autoComplete="name"
          withAsterisk
          label="Full Name"
          placeholder="Firstname Lastname"
          {...form.getInputProps('fullName')}
          data-cy="customer-name"
          errorProps={{ 'data-cy': 'customer-name-error' }}
        />
        <TextInput
          autoComplete="email"
          withAsterisk
          label="Email"
          placeholder="your@email.com"
          {...form.getInputProps('email')}
          errorProps={{ 'data-cy': 'customer-email-error' }}
          data-cy="customer-email"
        />
        <TextInput
          autoComplete="street-address"
          withAsterisk
          label="Address"
          placeholder="ex: Paper Road 24"
          {...form.getInputProps('address')}
          data-cy="customer-address"
          errorProps={{ 'data-cy': 'customer-address-error' }}
        />
        <TextInput
          autoComplete="address-level2"
          withAsterisk
          label="City"
          placeholder="ex: Gothenburg"
          {...form.getInputProps('city')}
          data-cy="customer-city"
          errorProps={{ 'data-cy': 'customer-city-error' }}
        />
        <TextInput
          autoComplete="postal-code"
          withAsterisk
          type="number"
          label="Zip Code"
          placeholder="ex: 43152"
          {...form.getInputProps('zipCode')}
          data-cy="customer-zipcode"
          errorProps={{ 'data-cy': 'customer-zipcode-error' }}
        />
        <TextInput
          autoComplete="tel"
          type="number"
          withAsterisk
          label="Phone number"
          placeholder="ex: 0700415160"
          {...form.getInputProps('phoneNumber')}
          data-cy="customer-phone"
          errorProps={{ 'data-cy': 'customer-phone-error' }}
        />
        <Group position="right" mt="md">
          <Button
            sx={{ width: '100%' }}
            type="submit"
            // onClick={() => setShowModal(true)}
          >
            Place order
          </Button>
        </Group>
      </form>
    </Box>
  );
}

export default CheckoutForm;
