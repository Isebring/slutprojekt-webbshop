import {
  Box,
  CloseButton,
  Flex,
  MultiSelect,
  MultiSelectValueProps,
  rem,
  SelectItem,
  SelectItemProps,
} from '@mantine/core';
import { forwardRef, useEffect, useState } from 'react';

export interface Category {
  name: string;
  _id: string;
}

function Value({
  label,
  onRemove,
  ...others
}: MultiSelectValueProps & { value: string }) {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        cursor: 'default',
        alignItems: 'center',
        backgroundColor:
          theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        border: `${rem(1)} solid ${
          theme.colorScheme === 'dark'
            ? theme.colors.dark[7]
            : theme.colors.gray[4]
        }`,
        paddingLeft: theme.spacing.xs,
        borderRadius: theme.radius.sm,
      })}
      {...others}
    >
      <Box sx={{ lineHeight: 1, fontSize: rem(12) }} mr={10}>
        {label}
      </Box>
      <CloseButton
        onMouseDown={onRemove}
        variant="transparent"
        size={22}
        iconSize={14}
        tabIndex={-1}
      />
    </Box>
  );
}

const Item = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ label, ...others }, ref) => {
    return (
      <div ref={ref} {...others}>
        <Flex align="center">
          <div>{label}</div>
        </Flex>
      </div>
    );
  },
);

const customFilter = (value: string, selected: boolean, item: SelectItem) => {
  return typeof item.label === 'string'
    ? item.label.toLowerCase().includes(value.toLowerCase())
    : false;
};

interface CategoryFilterProps {
  value: string[]; // selected category ids
  onChange: (categoryIds: string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = (props) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch('/api/categories');
      const categories = await response.json();
      console.log(categories);
      setCategories(categories);
    };
    fetchCategories();
  }, []);

  const data = categories.map((category) => ({
    value: category._id,
    label: category.name,
  }));

  return (
    <MultiSelect
      data={data}
      valueComponent={Value}
      itemComponent={Item}
      searchable
      value={props.value}
      onChange={props.onChange}
      placeholder="Filter by category"
      filter={customFilter}
    />
  );
};

export default CategoryFilter;
