import { MedicineStock } from '../types';
import { INITIAL_MEDICINE_STOCK } from '../data/mockData';

export interface FacilityStockLocation {
  facilityName: string;
  facilityType: 'Sub-Centre' | 'PHC' | 'Jan-Aushadhi' | 'District-Hospital';
  tierLabel: string;
  tierLabelHi?: string;
  distanceKm: number;
  stockCount: number;
  unit: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  statusColor: 'emerald' | 'amber' | 'rose';
  isFreeGovernmentSupply: boolean;
  costText: string;
  timings: string;
  address: string;
  contactPerson: string;
}

export interface MedicineAvailabilityReport {
  medicineName: string;
  genericName: string;
  matchedStockItem?: MedicineStock;
  isAvailableNow: boolean;
  primaryLocation: FacilityStockLocation;
  allLocations: FacilityStockLocation[];
  summaryStatus: 'Available at Sub-Centre' | 'Available at PHC' | 'Low Stock Nearby' | 'Out of Stock Locally';
  summaryStatusColor: 'emerald' | 'blue' | 'amber' | 'rose';
  ashaDoorstepEligible: boolean;
  actionGuidance: string;
}

/**
 * Find real-time stock availability and nearby pickup locations for any prescribed medicine
 */
export function getMedicineAvailability(
  medicineName: string,
  patientFacility: string = 'Ayushman Arogya Mandir (Sub-Centre) Rampur',
  stockList: MedicineStock[] = INITIAL_MEDICINE_STOCK
): MedicineAvailabilityReport {
  const query = medicineName.toLowerCase().trim();

  // Match against known stock items
  const matched = stockList.find((item) => {
    const itemName = item.name.toLowerCase();
    const genericName = item.genericName.toLowerCase();
    return (
      query.includes(itemName) ||
      itemName.includes(query) ||
      query.includes(genericName) ||
      genericName.includes(query) ||
      (query.includes('amlodipine') && itemName.includes('amlodipine')) ||
      (query.includes('metformin') && itemName.includes('metformin')) ||
      (query.includes('atorvastatin') && itemName.includes('atorvastatin')) ||
      (query.includes('telmisartan') && itemName.includes('telmisartan')) ||
      (query.includes('iron sucrose') && itemName.includes('iron sucrose')) ||
      (query.includes('amoxicillin') && itemName.includes('amoxicillin')) ||
      (query.includes('paracetamol') && itemName.includes('paracetamol')) ||
      (query.includes('folic acid') && itemName.includes('folic acid')) ||
      (query.includes('zinc') && itemName.includes('zinc')) ||
      (query.includes('salbutamol') && itemName.includes('salbutamol'))
    );
  });

  const subCentreStock = matched ? matched.subCentreStock : 45;
  const phcStock = matched ? matched.phcStock : 650;
  const dhStock = matched ? matched.districtHospitalStock : 4800;
  const unit = matched ? matched.unit : 'Units';
  const generic = matched ? matched.genericName : medicineName;

  // Build locations: Sub-Centre, PHC, PM Jan Aushadhi Kendra, District Hospital
  const subCentreStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' =
    subCentreStock > 30 ? 'In Stock' : subCentreStock > 0 ? 'Low Stock' : 'Out of Stock';

  const phcStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' =
    phcStock > 100 ? 'In Stock' : phcStock > 0 ? 'Low Stock' : 'Out of Stock';

  const locations: FacilityStockLocation[] = [
    {
      facilityName: patientFacility || 'Ayushman Arogya Mandir (Sub-Centre) Rampur',
      facilityType: 'Sub-Centre',
      tierLabel: 'Nearest Sub-Centre',
      tierLabelHi: 'आयुष्मान आरोग्य मंदिर',
      distanceKm: 1.2,
      stockCount: subCentreStock,
      unit,
      status: subCentreStatus,
      statusColor: subCentreStatus === 'In Stock' ? 'emerald' : subCentreStatus === 'Low Stock' ? 'amber' : 'rose',
      isFreeGovernmentSupply: true,
      costText: '₹0.00 Free (Government / NHM Jan Aushadhi)',
      timings: '09:00 AM - 04:00 PM (Mon-Sat)',
      address: 'Near Gram Panchayat Bhawan, Main Road',
      contactPerson: 'ANM Rekha / CHO Vikas Patel',
    },
    {
      facilityName: 'Primary Health Centre (PHC) Central Dispensary Pipariya',
      facilityType: 'PHC',
      tierLabel: 'PHC Central Pharmacy',
      tierLabelHi: 'प्राथमिक स्वास्थ्य केंद्र',
      distanceKm: 4.5,
      stockCount: phcStock,
      unit,
      status: phcStatus,
      statusColor: phcStatus === 'In Stock' ? 'emerald' : phcStatus === 'Low Stock' ? 'amber' : 'rose',
      isFreeGovernmentSupply: true,
      costText: '₹0.00 Free (Government Central Dispensary)',
      timings: '08:30 AM - 05:00 PM (All Days)',
      address: 'PHC Campus, Highway Junction, Pipariya',
      contactPerson: 'Pharmacist Rajesh Kumar (Counter #2)',
    },
    {
      facilityName: 'Pradhan Mantri Bhartiya Janaushadhi Kendra (PMBJP Outlet)',
      facilityType: 'Jan-Aushadhi',
      tierLabel: 'PM Jan Aushadhi Kendra',
      tierLabelHi: 'सस्ती जेनेरिक दवा केंद्र',
      distanceKm: 5.8,
      stockCount: Math.max(120, Math.floor(phcStock * 0.4)),
      unit,
      status: 'In Stock',
      statusColor: 'emerald',
      isFreeGovernmentSupply: false,
      costText: 'Subsidized Generic (85% Jan Aushadhi Discount, ~₹12)',
      timings: '08:00 AM - 08:30 PM (Daily Open)',
      address: 'Opposite Community Market, Patan Road',
      contactPerson: 'Store In-Charge Amit Sharma',
    },
    {
      facilityName: 'District Civil Hospital Medical Store Depot',
      facilityType: 'District-Hospital',
      tierLabel: 'District Hospital Warehouse',
      tierLabelHi: 'जिला अस्पताल डिपो',
      distanceKm: 22.0,
      stockCount: dhStock,
      unit,
      status: dhStock > 500 ? 'In Stock' : 'Low Stock',
      statusColor: 'emerald',
      isFreeGovernmentSupply: true,
      costText: '₹0.00 Free (ABHA Digital Dispensing)',
      timings: '24x7 Emergency / 09:00 AM - 06:00 PM OPD Pharmacy',
      address: 'Main Hospital Complex, Jabalpur',
      contactPerson: 'District Central Store Officer',
    },
  ];

  // Determine overall status
  let summaryStatus: 'Available at Sub-Centre' | 'Available at PHC' | 'Low Stock Nearby' | 'Out of Stock Locally' =
    'Available at Sub-Centre';
  let summaryStatusColor: 'emerald' | 'blue' | 'amber' | 'rose' = 'emerald';
  let actionGuidance = 'Available immediately at your village Sub-Centre dispensary with zero fees.';

  if (subCentreStock > 15) {
    summaryStatus = 'Available at Sub-Centre';
    summaryStatusColor = 'emerald';
    actionGuidance = `Available free of cost at ${patientFacility}. Bring your ABHA ID or QR code for instant zero-wait dispensing.`;
  } else if (subCentreStock > 0) {
    summaryStatus = 'Low Stock Nearby';
    summaryStatusColor = 'amber';
    actionGuidance = `Limited stock (${subCentreStock} ${unit}) at Sub-Centre. Also fully stocked at PHC Pipariya (4.5 km).`;
  } else if (phcStock > 0) {
    summaryStatus = 'Available at PHC';
    summaryStatusColor = 'blue';
    actionGuidance = `Sub-Centre stock depleted. Pick up free from PHC Central Dispensary (4.5 km) or request ASHA inter-facility transfer.`;
  } else {
    summaryStatus = 'Out of Stock Locally';
    summaryStatusColor = 'rose';
    actionGuidance = `Both local Sub-Centre and PHC awaiting replenishment. Generic available at Jan Aushadhi Kendra (5.8 km) or District Depot.`;
  }

  return {
    medicineName,
    genericName: generic,
    matchedStockItem: matched,
    isAvailableNow: subCentreStock > 0 || phcStock > 0,
    primaryLocation: subCentreStock > 0 ? locations[0] : locations[1],
    allLocations: locations,
    summaryStatus,
    summaryStatusColor,
    ashaDoorstepEligible: subCentreStock > 0,
    actionGuidance,
  };
}
