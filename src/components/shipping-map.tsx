"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface ShippingMapProps {
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  name: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

export function ShippingMap({ address, name }: ShippingMapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!apiKey) {
        setLoading(false);
        return;
      }

      try {
        // Build full address string
        const fullAddress = `${address.line1}, ${address.city}, ${address.state} ${address.postal_code}, ${address.country}`;
        
        // Use Google Geocoding API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
        );
        
        const data = await response.json() as {
          results?: Array<{
            geometry: {
              location: { lat: number; lng: number };
            };
          }>;
        };
        
        if (data.results && data.results.length > 0) {
          const location = data.results[0]?.geometry.location;
          if (location) {
            setCoordinates({ lat: location.lat, lng: location.lng });
          }
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address, apiKey]);

  if (!apiKey) {
    return (
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Shipping Address</h3>
        <p className="text-sm text-gray-600">{name}</p>
        <p className="text-sm text-gray-600">{address.line1}</p>
        {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
        <p className="text-sm text-gray-600">
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p className="text-sm text-gray-600">{address.country}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Shipping Address</h3>
        <p className="text-sm text-gray-600">{name}</p>
        <p className="text-sm text-gray-600">{address.line1}</p>
        {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
        <p className="text-sm text-gray-600">
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p className="text-sm text-gray-600">{address.country}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden">
      <div className="p-4 bg-white border-b">
        <h3 className="font-semibold mb-2">Shipping To:</h3>
        <p className="text-sm text-gray-600">{name}</p>
        <p className="text-sm text-gray-600">{address.line1}</p>
        {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
        <p className="text-sm text-gray-600">
          {address.city}, {address.state} {address.postal_code}
        </p>
        <p className="text-sm text-gray-600">{address.country}</p>
      </div>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={coordinates}
          zoom={15}
        >
          <Marker position={coordinates} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
