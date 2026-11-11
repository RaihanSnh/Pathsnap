import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Destination, RoutePoint, Accommodation, Attraction } from '../../types';
import { MapPin, Hotel, Map, Trash2, Plus, Calendar, DollarSign, Star } from 'lucide-react';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/helpers';

interface RouteSidebarProps {
  selectedDestinations: RoutePoint[];
  destinations: Destination[];
  accommodations: Accommodation[];
  attractions: Attraction[];
  onRemoveDestination: (index: number) => void;
  onUpdateDuration: (index: number, duration: number) => void;
  onSelectAccommodation: (routePointIndex: number, accommodationId: string) => void;
  onToggleAttraction: (routePointIndex: number, attractionId: string) => void;
  totalCost: number;
  totalDuration: number;
}

const RouteSidebar: React.FC<RouteSidebarProps> = ({
  selectedDestinations,
  destinations,
  accommodations,
  attractions,
  onRemoveDestination,
  onUpdateDuration,
  onSelectAccommodation,
  onToggleAttraction,
  totalCost,
  totalDuration
}) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="bg-teal-700 px-4 py-3 text-white">
        <h3 className="flex items-center text-base font-semibold">
          <MapPin size={18} className="mr-2" />
          Your Route
        </h3>
        {selectedDestinations.length > 0 && (
          <div className="mt-2 flex items-center gap-4 text-sm text-teal-50">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{totalDuration} {totalDuration === 1 ? 'day' : 'days'}</span>
            </div>
            <div className="flex items-center">
              <DollarSign size={14} className="mr-1" />
              <span>{formatCurrency(totalCost)}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/70 p-3">
        {selectedDestinations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-10 text-center text-sm text-gray-500">
            <MapPin size={36} className="mx-auto mb-3 text-gray-300" />
            <p>Click a destination on the map to add it to your route.</p>
          </div>
        ) : (
          <AnimatePresence>
            {selectedDestinations.map((routePoint, index) => {
              const destination = destinations.find(d => d.id === routePoint.destinationId);
              
              if (!destination) return null;
              
              // Find accommodations for this destination
              const destinationAccommodations = accommodations.filter(
                acc => acc.destinationId === destination.id
              );
              
              // Find attractions for this destination
              const destinationAttractions = attractions.filter(
                attr => attr.destinationId === destination.id
              );
              
              // Find selected accommodation
              const selectedAccommodation = accommodations.find(
                acc => acc.id === routePoint.selectedAccommodationId
              );
              
              return (
                <motion.div
                  key={routePoint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 bg-white px-3 py-3">
                    <div className="flex min-w-0 items-center">
                      <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-gray-900">{destination.name}</h4>
                        <p className="text-xs text-gray-500">{destination.country}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveDestination(index)}
                      aria-label={`Remove ${destination.name} from route`}
                      className="ml-2 rounded-md p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4 p-3">
                    <div className="mb-3">
                      <label className="block text-sm text-gray-600 mb-1">Stay Duration</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateDuration(index, Math.max(1, routePoint.stayDuration - 1))}
                          className="border rounded-l px-2 py-1 bg-gray-100 hover:bg-gray-200"
                          disabled={routePoint.stayDuration <= 1}
                        >
                          -
                        </button>
                        <span className="border-t border-b px-4 py-1 min-w-[40px] text-center">
                          {routePoint.stayDuration}
                        </span>
                        <button
                          onClick={() => onUpdateDuration(index, routePoint.stayDuration + 1)}
                          className="border rounded-r px-2 py-1 bg-gray-100 hover:bg-gray-200"
                        >
                          +
                        </button>
                        <span className="ml-2 text-sm text-gray-600">{routePoint.stayDuration > 1 ? 'days' : 'day'}</span>
                      </div>
                    </div>
                    
                    {/* Accommodations */}
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <Hotel size={16} className="mr-1 text-gray-600" />
                        <h5 className="font-medium text-sm">Accommodation</h5>
                      </div>
                      
                      {destinationAccommodations.length > 0 ? (
                        <div className="space-y-2">
                          {destinationAccommodations.map(accommodation => (
                            <div
                              key={accommodation.id}
                              onClick={() => onSelectAccommodation(index, accommodation.id)}
                              className={`flex items-center gap-2.5 rounded-lg p-2 transition-colors ${
                                routePoint.selectedAccommodationId === accommodation.id
                                  ? 'bg-teal-50 border border-teal-200'
                                  : 'hover:bg-gray-50 border border-gray-100'
                              }`}
                            >
                              <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                <img 
                                  src={accommodation.image} 
                                  alt={accommodation.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{accommodation.name}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Star size={12} className="text-yellow-400 mr-0.5" />
                                  <span>{accommodation.rating > 0 ? accommodation.rating.toFixed(1) : '—'}</span>
                                  {accommodation.ratingCount > 0 && (
                                    <span className="ml-0.5">({accommodation.ratingCount.toLocaleString()})</span>
                                  )}
                                  <span className="mx-1">·</span>
                                  <span>{accommodation.price > 0 ? `${formatCurrency(accommodation.price)} / night` : 'Price unavailable'}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No accommodations available</p>
                      )}
                    </div>
                    
                    {/* Attractions */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Map size={16} className="mr-1 text-gray-600" />
                          <h5 className="font-medium text-sm">Attractions</h5>
                        </div>
                        {routePoint.selectedAttractions.length > 0 && (
                          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                            {routePoint.selectedAttractions.length} selected
                          </span>
                        )}
                      </div>
                      
                      {destinationAttractions.length > 0 ? (
                        <div className="space-y-2">
                          {destinationAttractions.map(attraction => (
                            <div
                              key={attraction.id}
                              onClick={() => onToggleAttraction(index, attraction.id)}
                              className={`flex items-center gap-2.5 rounded-lg p-2 transition-colors ${
                                routePoint.selectedAttractions.includes(attraction.id)
                                  ? 'bg-teal-50 border border-teal-200'
                                  : 'hover:bg-gray-50 border border-gray-100'
                              }`}
                            >
                              <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                <img 
                                  src={attraction.image} 
                                  alt={attraction.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attraction.name}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Star size={12} className="text-yellow-400 mr-0.5" />
                                  <span>{attraction.rating > 0 ? attraction.rating.toFixed(1) : '—'}</span>
                                  {attraction.ratingCount > 0 && (
                                    <span className="ml-0.5">({attraction.ratingCount.toLocaleString()})</span>
                                  )}
                                  <span className="mx-1">·</span>
                                  <span>{attraction.price ? formatCurrency(attraction.price) : 'Free'}</span>
                                </div>
                              </div>
                              <div className="ml-2">
                                {routePoint.selectedAttractions.includes(attraction.id) ? (
                                  <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 border border-gray-300 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No attractions available</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      
      <div className="border-t border-gray-100 bg-white p-3">
        <Button
          variant="primary"
          fullWidth
          disabled={selectedDestinations.length === 0}
        >
          Save Itinerary
        </Button>
      </div>
    </div>
  );
};

export default RouteSidebar;
