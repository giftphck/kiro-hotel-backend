export interface Customer {
  customerId: string;
  name: string;
  phoneNumber: string;
  thaiIdCard: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCustomerDto {
  name: string;
  phoneNumber: string;
  thaiIdCard: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phoneNumber?: string;
  thaiIdCard?: string;
}
