"use client";

import { useRef, useState } from "react";
import { Input } from "@/ui/shadcn/input";
import { Label } from "@/ui/shadcn/label";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

export interface AddressComponents {
  fullName?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

interface AddressAutocompleteProps {
  title: string;
  value: string;
  onAddressSelect: (address: AddressComponents) => void;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function AddressAutocomplete({
  title,
  value,
  onAddressSelect,
  onChange,
  error,
  disabled = false,
}: AddressAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (!place.address_components) {
        return;
      }

      // Parse address components
      let streetNumber = "";
      let route = "";
      let city = "";
      let state = "";
      let postalCode = "";
      let country = "Canada";

      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("street_number")) {
          streetNumber = component.long_name;
        }
        if (types.includes("route")) {
          route = component.long_name;
        }
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.short_name;
        }
        if (types.includes("postal_code")) {
          postalCode = component.long_name;
        }
        if (types.includes("country")) {
          country = component.short_name;
        }
      }

      const address1 = `${streetNumber} ${route}`.trim();

      onAddressSelect({
        address1,
        city,
        state,
        postalCode,
        country,
      });
    }
  };

  if (!apiKey) {
    // Fallback to regular input if no API key
    return (
      <div>
        <Label htmlFor={`${title}-address1`} className="text-sm font-medium">
          Address *
        </Label>
        <Input
          id={`${title}-address1`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={error ? "border-red-500" : ""}
          placeholder="123 Main St"
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={() => setIsLoaded(true)}
    >
      <div>
        <Label htmlFor={`${title}-address1`} className="text-sm font-medium">
          Address *
        </Label>
        {isLoaded ? (
          <Autocomplete
            onLoad={onLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              types: ["address"],
              componentRestrictions: { country: "ca" },
            }}
          >
            <Input
              id={`${title}-address1`}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={error ? "border-red-500" : ""}
              placeholder="Start typing your address..."
            />
          </Autocomplete>
        ) : (
          <Input
            id={`${title}-address1`}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={error ? "border-red-500" : ""}
            placeholder="Loading..."
          />
        )}
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    </LoadScript>
  );
}
