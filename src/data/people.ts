import type { Customer, Employee } from '@/types/models'
import { isoDaysAgo } from './clock'

/** DEMO DATA: fictional buyers. Emails use the reserved .example domain. */
export const CUSTOMERS: Customer[] = [
  { id: 'c-arcadia', name: 'Jonas Keller', company: 'Arcadia Stone GmbH', phone: '+49 40 555 0142', email: 'j.keller@arcadia-stone.example', city: 'Hamburg', country: 'Germany', segment: 'Exporter', since: '2023-02-14', notes: 'Buys Black Galaxy for European slab supply. Prefers 40 ft container loading with QC photos.' },
  { id: 'c-lumina', name: 'Wei Chen', company: 'Lumina Stone Trading Co.', phone: '+86 592 555 0187', email: 'wei.chen@lumina-stone.example', city: 'Xiamen', country: 'China', segment: 'Exporter', since: '2022-08-03', notes: 'Large monthly volumes. Payment by letter of credit.' },
  { id: 'c-vijaya', name: 'K. Srinivasa Rao', company: 'Vijaya Marble & Granites', phone: '+91 90000 12011', email: 'srao@vijaya-granites.example', city: 'Hyderabad', country: 'India', segment: 'Dealer', since: '2019-05-21', notes: 'Long-standing dealer. Often buys mixed lots of Steel Grey and Tan Brown.' },
  { id: 'c-coastal', name: 'Meenakshi Iyer', company: 'Coastal Stone Exports Pvt Ltd', phone: '+91 90000 12022', email: 'meenakshi@coastalstone.example', city: 'Chennai', country: 'India', segment: 'Exporter', since: '2020-11-09', notes: 'Ships via Chennai and Krishnapatnam. Needs documentation packs with every dispatch.' },
  { id: 'c-ramanathan', name: 'P. Ramanathan', company: 'Ramanathan Fabricators', phone: '+91 90000 12033', email: 'ram@ramanathan-fab.example', city: 'Coimbatore', country: 'India', segment: 'Fabricator', since: '2021-03-17', notes: 'Cuts kitchen tops. Buys Tan Brown and Absolute Black.' },
  { id: 'c-kiran', name: 'Kiran Reddy', company: 'Kiran Infra Projects', phone: '+91 90000 12044', email: 'kiran@kiraninfra.example', city: 'Bengaluru', country: 'India', segment: 'Contractor', since: '2024-01-12', notes: 'Project-based buyer. Orders follow site schedules.' },
  { id: 'c-alnoor', name: 'Omar Al Farsi', company: 'Al Noor Building Materials LLC', phone: '+971 4 555 0119', email: 'omar@alnoor-bm.example', city: 'Dubai', country: 'UAE', segment: 'Dealer', since: '2023-09-28', notes: 'Prefers Colonial and Viscount White. Pays advance before dispatch.' },
  { id: 'c-sundaram', name: 'R. Sundaram', company: 'Sundaram Monuments', phone: '+91 90000 12055', email: 'sundaram@sundaram-monuments.example', city: 'Madurai', country: 'India', segment: 'Monument maker', since: '2018-07-04', notes: 'Absolute Black only, smaller blocks.' },
  { id: 'c-pinnacle', name: 'Aditi Deshmukh', company: 'Pinnacle Stoneworks', phone: '+91 90000 12066', email: 'aditi@pinnaclestone.example', city: 'Pune', country: 'India', segment: 'Fabricator', since: '2022-04-19', notes: 'Slab manufacturer. Sensitive to colour consistency across lots.' },
  { id: 'c-bhavani', name: 'V. Bhavani Prasad', company: 'Bhavani Tiles & Stones', phone: '+91 90000 12077', email: 'bhavani@bhavanitiles.example', city: 'Vijayawada', country: 'India', segment: 'Dealer', since: '2020-01-30', notes: 'Regional dealer; frequent small orders.' },
  { id: 'c-northgate', name: 'Priya Nair', company: 'Northgate Surfaces Ltd', phone: '+44 113 555 0164', email: 'priya.nair@northgate-surfaces.example', city: 'Leeds', country: 'United Kingdom', segment: 'Fabricator', since: '2024-06-06', notes: 'New account. Trial lot of Steel Grey completed.' },
  { id: 'c-deccan', name: 'Farhan Sheikh', company: 'Deccan Granite Crafts', phone: '+91 90000 12088', email: 'farhan@deccancrafts.example', city: 'Bidar', country: 'India', segment: 'Fabricator', since: '2021-10-11', notes: 'Handles monument and temple work.' },
]

export const getCustomer = (id: string) => CUSTOMERS.find((c) => c.id === id)

/** DEMO DATA: fictional staff. */
export const EMPLOYEES: Employee[] = [
  { id: 'e01', name: 'Venkat Ramana', title: 'Managing director', department: 'Management', phone: '+91 90000 13001', joined: '2009-04-01', monthlySalary: 185000, attendanceToday: 'present', daysPresentMonth: 17, assignment: 'Operations review', role: 'owner' },
  { id: 'e02', name: 'Lakshmi Prasanna', title: 'General manager', department: 'Management', phone: '+91 90000 13002', joined: '2013-06-10', monthlySalary: 112000, attendanceToday: 'present', daysPresentMonth: 18, assignment: 'Dispatch planning', role: 'manager' },
  { id: 'e03', name: 'Srinivas Naidu', title: 'Quarry supervisor', department: 'Extraction', phone: '+91 90000 13003', joined: '2011-02-15', monthlySalary: 68000, attendanceToday: 'present', daysPresentMonth: 18, assignment: 'Bench 1 and 2', role: 'manager' },
  { id: 'e04', name: 'Ravi Teja', title: 'Drill operator', department: 'Extraction', phone: '+91 90000 13004', joined: '2016-09-05', monthlySalary: 34000, attendanceToday: 'present', daysPresentMonth: 18, assignment: 'Drill rig DR-03', role: 'worker' },
  { id: 'e05', name: 'Mohan Krishna', title: 'Crane operator', department: 'Yard', phone: '+91 90000 13005', joined: '2015-01-19', monthlySalary: 38000, attendanceToday: 'present', daysPresentMonth: 17, assignment: 'Derrick CR-01', role: 'worker' },
  { id: 'e06', name: 'Abdul Rahim', title: 'Wire saw operator', department: 'Extraction', phone: '+91 90000 13006', joined: '2018-03-12', monthlySalary: 36000, attendanceToday: 'half_day', daysPresentMonth: 16, assignment: 'Bench 3', role: 'worker' },
  { id: 'e07', name: 'Padma Latha', title: 'Yard coordinator', department: 'Yard', phone: '+91 90000 13007', joined: '2019-07-22', monthlySalary: 42000, attendanceToday: 'present', daysPresentMonth: 18, assignment: 'Block tagging and QR', role: 'manager' },
  { id: 'e08', name: 'Suresh Babu', title: 'Fleet supervisor', department: 'Logistics', phone: '+91 90000 13008', joined: '2014-11-03', monthlySalary: 46000, attendanceToday: 'present', daysPresentMonth: 18, assignment: 'Trip scheduling', role: 'manager' },
  { id: 'e09', name: 'Ganesh Yadav', title: 'Truck driver', department: 'Logistics', phone: '+91 90000 13009', joined: '2017-05-08', monthlySalary: 30000, attendanceToday: 'present', daysPresentMonth: 15, assignment: 'On trip: Krishnapatnam', role: 'worker' },
  { id: 'e10', name: 'Harish Kumar', title: 'Truck driver', department: 'Logistics', phone: '+91 90000 13010', joined: '2020-08-17', monthlySalary: 30000, attendanceToday: 'leave', daysPresentMonth: 14, assignment: 'On leave', role: 'worker' },
  { id: 'e11', name: 'Sirisha Devi', title: 'Accounts executive', department: 'Accounts', phone: '+91 90000 13011', joined: '2018-10-01', monthlySalary: 52000, attendanceToday: 'present', daysPresentMonth: 18, assignment: 'Receivables follow-up', role: 'admin' },
  { id: 'e12', name: 'Tarun Sharma', title: 'Sales executive', department: 'Sales', phone: '+91 90000 13012', joined: '2021-02-08', monthlySalary: 48000, attendanceToday: 'present', daysPresentMonth: 18, assignment: 'Export enquiries', role: 'sales' },
  { id: 'e13', name: 'Nisha Fernandes', title: 'Sales executive', department: 'Sales', phone: '+91 90000 13013', joined: '2022-06-27', monthlySalary: 46000, attendanceToday: 'absent', daysPresentMonth: 13, assignment: 'Domestic dealers', role: 'sales' },
  { id: 'e14', name: 'Bhaskar Rao', title: 'Mechanic', department: 'Maintenance', phone: '+91 90000 13014', joined: '2016-04-14', monthlySalary: 39000, attendanceToday: 'present', daysPresentMonth: 18, assignment: 'Excavator EX-01 service', role: 'worker' },
  { id: 'e15', name: 'Chandrika Mohan', title: 'Site surveyor', department: 'Extraction', phone: '+91 90000 13015', joined: '2019-12-02', monthlySalary: 44000, attendanceToday: 'present', daysPresentMonth: 17, assignment: 'Bench survey', role: 'worker' },
]
export const getEmployee = (id: string) => EMPLOYEES.find((e) => e.id === id)
