import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { NotFoundError } from '../../middlewares/error-handler';
import { categoryModel } from '../categories/category-model';
import { ProductModel } from './product-model';
import {
  productUpdateSchema,
  productValidationSchema,
} from './product-validation';

export async function getAllProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const products = await ProductModel.find().populate('categories');
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProductById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId).populate({
      path: 'categories',
      select: '-products',
    });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log('Incoming product:', req.body);

    const incomingProduct = req.body;

    await productValidationSchema.validate(incomingProduct);
    const categories = await categoryModel.find({
      _id: { $in: incomingProduct.categories },
    });

    const newProduct = new ProductModel({
      ...incomingProduct,
      _id: new ObjectId(),
      categories: categories,
    });
    const savedProduct = await newProduct.save();

    const populatedProduct = await ProductModel.findById(
      savedProduct._id,
    ).populate('categories');

    if (populatedProduct) {
      const responseObj = {
        message: 'Product added',
        ...populatedProduct.toJSON(),
      };

      res.set('content-type', 'application/json');
      res.status(201).send(JSON.stringify(responseObj));
    } else {
      throw new Error('Product not found after creation');
    }
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const productId = req.params.id;
    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new NotFoundError(`Product with ID ${productId} not found`);
    }

    console.log('Update product:', { params: req.params, body: req.body });
    const validatedProduct = await productUpdateSchema.validate(req.body);

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      validatedProduct,
      { new: true },
    ).populate('categories');

    // Archive the old product
    product.isArchived = true;
    await product.save();
    console.log(product);

    // Create a new product with validated data
    const newProduct = new ProductModel({
      ...validatedProduct,
      _id: undefined,
      previousId: productId,
    });
    const savedProduct = await newProduct.save();

    // Send the new product as a response
    res.status(200).json({
      updatedProduct,
      newProduct: savedProduct,
      oldProductId: productId,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const productId = req.params.id;
    const deletedProduct = await ProductModel.findById(productId);

    if (!deletedProduct) {
      throw new NotFoundError('Product not found');
    }

    await categoryModel.updateMany(
      { _id: { $in: deletedProduct.categories } },
      { $pull: { products: productId } },
    );

    await ProductModel.findByIdAndDelete(productId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
