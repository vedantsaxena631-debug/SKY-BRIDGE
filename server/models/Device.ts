export interface IDevice {
  _id: string;
  deviceId: string;
  status: 'online' | 'offline' | 'degraded';
  lastSeen: Date | null;
  batteryVolts?: number;
  role?: string;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class DeviceModel {
  private devices: IDevice[] = [
    {
      _id: 'dev_a_demo',
      deviceId: 'A',
      status: 'online',
      lastSeen: new Date(),
      batteryVolts: 4.12,
      role: 'Team Alpha Station',
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'dev_drone_demo',
      deviceId: 'DRONE',
      status: 'online',
      lastSeen: new Date(),
      batteryVolts: 15.8,
      role: 'Airborne Repeater',
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: 'dev_b_demo',
      deviceId: 'B',
      status: 'online',
      lastSeen: new Date(),
      batteryVolts: 3.98,
      role: 'Team Bravo Station',
      isDemo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  find(filter: any = {}) {
    let result = this.devices.filter((d) => {
      if (filter.isDemo !== undefined && d.isDemo !== filter.isDemo) return false;
      if (filter.status && d.status !== filter.status) return false;
      if (filter.lastSeen && filter.lastSeen.$lt) {
        if (!d.lastSeen || d.lastSeen >= filter.lastSeen.$lt) return false;
      }
      return true;
    });

    const queryObj: any = {
      select: (_fields: string) => queryObj,
      lean: () => result.map((d) => ({ ...d })),
      then: (resolve: any, reject?: any) => {
        try {
          resolve(
            result.map((d) => ({
              ...d,
              toObject: () => ({ ...d }),
              save: async () => {
                const idx = this.devices.findIndex((x) => x._id === d._id);
                if (idx !== -1) this.devices[idx] = { ...d, updatedAt: new Date() };
                return d;
              },
            }))
          );
        } catch (e) {
          if (reject) reject(e);
        }
      },
    };
    return queryObj;
  }

  async findOneAndUpdate(filter: any, update: any, _options: any = {}): Promise<any> {
    let dev = this.devices.find((d) => {
      if (filter.deviceId && d.deviceId !== filter.deviceId) return false;
      if (filter.isDemo !== undefined && d.isDemo !== filter.isDemo) return false;
      return true;
    });

    if (!dev) {
      dev = {
        _id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        deviceId: filter.deviceId,
        status: 'online',
        lastSeen: new Date(),
        isDemo: filter.isDemo ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.devices.push(dev);
    }

    if (update.$set) {
      Object.assign(dev, update.$set);
    } else {
      Object.assign(dev, update);
    }
    dev.updatedAt = new Date();

    return {
      ...dev,
      toObject: () => ({ ...dev }),
      save: async () => dev,
    };
  }
}

export const Device = new DeviceModel();
export default Device;
