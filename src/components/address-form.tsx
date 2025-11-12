"use client";

import { useTranslations } from "@/i18n/client";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import { AddressAutocomplete, type AddressComponents } from "@/components/address-autocomplete";

export interface AddressFormData {
  fullName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface AddressFormProps {
  title: string;
  data: AddressFormData;
  onChange: (data: AddressFormData) => void;
  errors?: Partial<AddressFormData>;
  showPhone?: boolean;
  disabled?: boolean;
}

const COUNTRIES = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
];

export function AddressForm({ 
  title, 
  data, 
  onChange, 
  errors = {}, 
  showPhone = true, 
  disabled = false 
}: AddressFormProps) {
  const t = useTranslations("/cart.page.stripePayment");
  const tErrors = useTranslations("/cart.page.formErrors");

  const handleChange = (field: keyof AddressFormData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleAddressSelect = (addressComponents: AddressComponents) => {
    onChange({
      ...data,
      address1: addressComponents.address1,
      city: addressComponents.city,
      state: addressComponents.state,
      postalCode: addressComponents.postalCode,
      country: addressComponents.country,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Full Name */}
        <div>
          <Label htmlFor={`${title}-fullName`} className="text-sm font-medium">
            {t("fullName")} *
          </Label>
          <Input
            id={`${title}-fullName`}
            type="text"
            value={data.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            disabled={disabled}
            className={errors.fullName ? "border-red-500" : ""}
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-sm text-red-600 mt-1">{tErrors("nameRequired")}</p>
          )}
        </div>

        {/* Address Line 1 with Google Places Autocomplete */}
        <AddressAutocomplete
          title={title}
          value={data.address1}
          onAddressSelect={handleAddressSelect}
          onChange={(value) => handleChange('address1', value)}
          error={errors.address1 ? tErrors("line1Required") : undefined}
          disabled={disabled}
        />

        {/* Address Line 2 */}
        <div>
          <Label htmlFor={`${title}-address2`} className="text-sm font-medium">
            {t("address2")}
          </Label>
          <Input
            id={`${title}-address2`}
            type="text"
            value={data.address2}
            onChange={(e) => handleChange('address2', e.target.value)}
            disabled={disabled}
            placeholder="Apartment, suite, etc."
          />
        </div>

        {/* City and State/Province */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${title}-city`} className="text-sm font-medium">
              {t("city")} *
            </Label>
            <Input
              id={`${title}-city`}
              type="text"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={disabled}
              className={errors.city ? "border-red-500" : ""}
              placeholder="Montreal"
            />
            {errors.city && (
              <p className="text-sm text-red-600 mt-1">{tErrors("cityRequired")}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`${title}-state`} className="text-sm font-medium">
              {t("state")}
            </Label>
            <Input
              id={`${title}-state`}
              type="text"
              value={data.state}
              onChange={(e) => handleChange('state', e.target.value)}
              disabled={disabled}
              placeholder="QC"
            />
          </div>
        </div>

        {/* Postal Code and Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${title}-postalCode`} className="text-sm font-medium">
              {t("postalCode")} *
            </Label>
            <Input
              id={`${title}-postalCode`}
              type="text"
              value={data.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              disabled={disabled}
              className={errors.postalCode ? "border-red-500" : ""}
              placeholder="H1A 0A1"
            />
            {errors.postalCode && (
              <p className="text-sm text-red-600 mt-1">{tErrors("postalCodeRequired")}</p>
            )}
          </div>

          <div>
            <Label htmlFor={`${title}-country`} className="text-sm font-medium">
              {t("country")} *
            </Label>
            <select
              id={`${title}-country`}
              value={data.country}
              onChange={(e) => handleChange('country', e.target.value)}
              disabled={disabled}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.country ? "border-red-500" : ""
              }`}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-sm text-red-600 mt-1">{tErrors("countryRequired")}</p>
            )}
          </div>
        </div>

        {/* Phone Number */}
        {showPhone && (
          <div>
            <Label htmlFor={`${title}-phone`} className="text-sm font-medium">
              {t("phone")}
            </Label>
            <Input
              id={`${title}-phone`}
              type="tel"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={disabled}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        )}
      </div>
    </div>
  );
}