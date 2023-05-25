import { Button, Container, Group, SimpleGrid } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import CategoryFilter from '../components/CategoryFilter';
import { PageHero } from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import { Product, ProductContext } from '../contexts/ProductContext';

export function Accessories() {
  const { products } = useContext(ProductContext);
  const [sortDirection, setSortDirection] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortedProducts, setSortedProducts] = useState(products);
  const [activeButton, setActiveButton] = useState('');

  useEffect(() => {
    let sorted = [...products];

    if (sortDirection === 'ascending') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortDirection === 'descending') {
      sorted.sort((a, b) => b.price - a.price);
    }

    if (selectedCategories.length > 0) {
      sorted = sorted.filter((product: Product) =>
        product.category.some((category: string) =>
          selectedCategories.includes(category),
        ),
      );
    }

    setSortedProducts(sorted);
  }, [products, sortDirection, selectedCategories]);

  function sortProductsByLowestPrice() {
    setSortDirection('ascending');
    setActiveButton('lowest');
  }

  function sortProductsByHighestPrice() {
    setSortDirection('descending');
    setActiveButton('highest');
  }

  return (
    <Container size="lg">
      <PageHero
        title="Accessories"
        line1="The extra things"
        line2="you didn't know you needed."
      />
      <Group spacing={5} mb="md">
        <Button
          sx={{
            border: activeButton === 'lowest' ? '2px solid #5f3dc4' : 'none',
          }}
          variant="light"
          size="xs"
          radius="sm"
          onClick={sortProductsByLowestPrice}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Sort by lowest price
        </Button>
        <Button
          sx={{
            border: activeButton === 'highest' ? '2px solid #5f3dc4 ' : 'none',
          }}
          size="xs"
          variant="light"
          radius="sm"
          onClick={sortProductsByHighestPrice}
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Sort by highest price
        </Button>
        {products && (
          <CategoryFilter
            products={products}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
        )}
      </Group>
      <SimpleGrid
        cols={3}
        spacing="xl"
        verticalSpacing="xl"
        breakpoints={[
          { maxWidth: '85rem', cols: 2, spacing: 'md' },
          { maxWidth: '36rem', cols: 1, spacing: 'sm' },
        ]}
      >
        {sortedProducts.map((product: Product) => (
          <ProductCard
            key={product._id}
            product={product}
            sortedProducts={sortedProducts}
            sortDirection={sortDirection === 'ascending' ? 'lowest' : 'highest'}
            productId={''}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
}