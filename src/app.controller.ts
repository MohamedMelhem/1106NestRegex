import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { AppService } from './app.service.js';

interface OrderFormData {
  name: string;
  billing_city: string;
  billing_postal_code: string;
  billing_street: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_street: string;
  phone_number: string;
  coupon_code: string;
}

const emptyForm: OrderFormData = {
  name: '',
  billing_city: '',
  billing_postal_code: '',
  billing_street: '',
  shipping_city: '',
  shipping_postal_code: '',
  shipping_street: '',
  phone_number: '',
  coupon_code: '',
};

function getString(body: Record<string, unknown>, field: string): string {
  const value = body[field];
  return typeof value === 'string' ? value.trim() : '';
}

function getFormData(body: Record<string, unknown>): OrderFormData {
  return {
    name: getString(body, 'name'),
    billing_city: getString(body, 'billing_city'),
    billing_postal_code: getString(body, 'billing_postal_code'),
    billing_street: getString(body, 'billing_street'),
    shipping_city: getString(body, 'shipping_city'),
    shipping_postal_code: getString(body, 'shipping_postal_code'),
    shipping_street: getString(body, 'shipping_street'),
    phone_number: getString(body, 'phone_number'),
    coupon_code: getString(body, 'coupon_code'),
  };
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @Render('index')
  getFooldal() {
    return { formData: emptyForm };
  }

  @Post('/')
  @Render('index')
  editProfile(@Body() body: Record<string, unknown>) {
    const formData = getFormData(body);
    const nameRegex = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,99}$/u;
    if (!nameRegex.test(formData.name)) {
      return { formData, error: 'Adjon meg egy érvényes nevet.' };
    }

    const cityRegex = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,59}$/u;
    if (!cityRegex.test(formData.billing_city)) {
      return { formData, error: 'Adja meg helyesen a számlázási várost.' };
    }

    const postalCodeRegex = /^\d{4}$/;
    if (!postalCodeRegex.test(formData.billing_postal_code)) {
      return {
        formData,
        error: 'A számlázási irányítószám 4 számjegyből álljon.',
      };
    }

    const streetRegex = /^(?=.*\d)[\p{L}\p{M}\d][\p{L}\p{M}\d .,'’/#-]{1,99}$/u;
    if (!streetRegex.test(formData.billing_street)) {
      return {
        formData,
        error: 'Adja meg helyesen a számlázási utcát és házszámot.',
      };
    }

    if (!cityRegex.test(formData.shipping_city)) {
      return { formData, error: 'Adja meg helyesen a szállítási várost.' };
    }

    if (!postalCodeRegex.test(formData.shipping_postal_code)) {
      return {
        formData,
        error: 'A szállítási irányítószám 4 számjegyből álljon.',
      };
    }

    if (!streetRegex.test(formData.shipping_street)) {
      return {
        formData,
        error: 'Adja meg helyesen a szállítási utcát és házszámot.',
      };
    }

    const normalizedPhone = formData.phone_number.replace(/[\s()-]/g, '');
    const phoneRegex = /^\+36(?:1\d{7}|(?:20|30|31|50|70)\d{7})$/;
    if (!phoneRegex.test(normalizedPhone)) {
      return {
        formData,
        error: 'Adjon meg érvényes, +36-os magyar telefonszámot.',
      };
    }

    const couponRegex = /^[A-Z]{2}-\d{4}$/;
    if (formData.coupon_code && !couponRegex.test(formData.coupon_code)) {
      return {
        formData,
        error: 'A kuponkód formátuma két nagybetű-kötőjel-négy számjegy.',
      };
    }

    const cardholderRegex = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,99}$/u;
    if (!cardholderRegex.test(getString(body, 'cardholder'))) {
      return {
        formData,
        error: 'Adja meg a kártyabirtokos nevét.',
      };
    }

    const cardNumberRegex = /^\d{13,19}$/;
    if (!cardNumberRegex.test(getString(body, 'card_number'))) {
      return {
        formData,
        error: 'A bankkártyaszám 13–19 számjegyből álljon.',
      };
    }

    const cardExpiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!cardExpiryRegex.test(getString(body, 'card_expiry'))) {
      return {
        formData,
        error: 'A lejárat formátuma HH/ÉÉ legyen, például 12/28.',
      };
    }

    const cardCvcRegex = /^\d{3,4}$/;
    if (!cardCvcRegex.test(getString(body, 'card_cvc'))) {
      return {
        formData,
        error: 'A CVC-kód 3 vagy 4 számjegyből álljon.',
      };
    }

    return { formData, success: 'Az adatok formátuma helyes.' };
  }
}
