import {
  Box,
  Button,
  FileInput,
  Group,
  MultiSelect,
  TextInput,
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Product } from '../../data';
import generateID from '../utils/generateID';
import { categoryData } from './CategoryData';

interface ProductFormProps {
  onSubmit: (product: Product) => void;
  addProduct: (product: Product) => void;
  isEditing: boolean;
  product?: Product;
}

const schema = Yup.object().shape({
  imageId: Yup.string().required('Image is required'),
  title: Yup.string()
    .min(2, 'Title should have at least 2 letters')
    .required('Title is required'),
  description: Yup.string()
    .min(5, 'Description should have at least 5 letters')
    .required('Description is required'),
  price: Yup.number()
    .min(1, 'Nothing is this cheap...')
    .required('Price is required')
    .strict(),
  category: Yup.array()
    .of(Yup.string().min(2))
    .required('At least one category is required'),
});

function ProductForm({
  onSubmit,
  addProduct,
  isEditing,
  product,
}: ProductFormProps) {
  const navigate = useNavigate();
  const form = useForm<Product>({
    validate: yupResolver(schema),
    initialValues: {
      id: '',
      image: '',
      imageId: '',
      title: '',
      description: '',
      price: null as never,
      secondImage: '',
      summary: [],
      rating: 0,
      usersRated: 0,
      category: [] as never,
    },
  });
  useEffect(() => {
    if (isEditing && product) {
      form.setValues(product);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isEditing, form.setValues]);

  const handleSubmit = (values: Product) => {
    const editedProduct = {
      ...values,
      id: product?.id || '',
      category: values.category || [],
    };
    if (isEditing) {
      onSubmit(editedProduct);
    } else {
      addProduct({ ...editedProduct, id: generateID() });
    }
    form.reset();
    navigate('/admin');
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    // Skapa FormData och lägg till filen
    // Skicka till API
    // Spara ID i formet
    form.setFieldValue('imageId', '1234');
  };

  return (
    <Box maw={300} mx="auto">
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        data-cy="product-form"
        id="product-form"
      >
        <TextInput
          withAsterisk
          label="Title"
          placeholder="ComputerBook 2000"
          {...form.getInputProps('title')}
          data-cy="product-title"
          errorProps={{ 'data-cy': 'product-title-error' }}
        />
        <FileInput
          withAsterisk
          label="Image URL"
          placeholder="https://www.image.com/image1.png"
          {...form.getInputProps('imageId')}
          onChange={handleImageUpload}
          data-cy="product-image"
          errorProps={{ 'data-cy': 'product-image-error' }}
        />
        <TextInput
          label="Second Image URL"
          placeholder="https://www.image.com/image2.png"
          {...form.getInputProps('secondImage')}
          errorProps={{ 'data-cy': 'product-image-error' }}
        />
        <TextInput
          withAsterisk
          label="Description"
          placeholder="This is the description of this product."
          {...form.getInputProps('description')}
          data-cy="product-description"
          errorProps={{ 'data-cy': 'product-description-error' }}
        />
        <TextInput
          withAsterisk
          type="number"
          label="Price"
          placeholder="1000"
          {...form.getInputProps('price')}
          onChange={(e) => form.setFieldValue('price', Number(e.target.value))}
          data-cy="product-price"
          errorProps={{ 'data-cy': 'product-price-error' }}
        />
        <MultiSelect
          data={categoryData}
          label="Category"
          placeholder="Select categories"
          {...form.getInputProps('category')}
          errorProps={{ 'data-cy': 'product-categories-error' }}
        />

        <Group mt="xl">
          <Button type="submit">
            {isEditing ? 'Save changes' : 'Add new Product'}
          </Button>
        </Group>
      </form>
    </Box>
  );
}

export default ProductForm;
