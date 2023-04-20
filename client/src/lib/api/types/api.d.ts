declare namespace API {
  type Session = {
    token: {
      access: string;
      refresh: string;
    };
    user: {
      id: string;
      username: string;
      role: string;
      jti: string;
      iat: number;
      exp: number;
    };
  };

  type User = {
    id: string;
    username: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };

  type Subject = {
    id: string;
    code: string;
    name: string;
    credit: number;
    lecture: number;
    lab: number;
    exam: number;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Instructor = {
    id: string;
    name: string;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Building = {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Room = {
    id: string;
    type: string;
    name: string;
    building: Omit<Building, 'createdAt' | 'updatedAt'>;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Course = {
    id: string;
    name: string;
    detail: {
      subject: Omit<Subject, 'createdAt' | 'updatedAt'>;
      type: string;
    }[];
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };
}
