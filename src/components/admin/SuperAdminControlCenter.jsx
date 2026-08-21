import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  IndianRupee,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { BACKEND_API } from "../../config/api";

const EMPTY_STATS = {
  totalUsers: 0,
  newUsers: 0,
  totalProperties: 0,
  pendingProperties: 0,
  approvedProperties: 0,
  totalVehicles: 0,
  pendingVehicles: 0,
  approvedVehicles: 0,
  totalBookings: 0,
  pendingBookings: 0,
  totalRevenue: 0,
};

const USER_ARRAY_KEYS = [
  "users",
  "data",
  "results",
  "items",
  "allUsers",
];

const PROPERTY_ARRAY_KEYS = [
  "properties",
  "data",
  "results",
  "items",
  "allProperties",
];

const VEHICLE_ARRAY_KEYS = [
  "vehicles",
  "data",
  "results",
  "items",
  "allVehicles",
];

const BOOKING_ARRAY_KEYS = [
  "bookings",
  "data",
  "results",
  "items",
  "allBookings",
];

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getRecordId = (record) =>
  record?._id ||
  record?.id ||
  record?.userId ||
  record?.propertyId ||
  record?.vehicleId ||
  "";

const getCreatedTime = (record) => {
  const value =
    record?.createdAt ||
    record?.created_at ||
    record?.registeredAt ||
    record?.dateCreated;

  const time = value ? new Date(value).getTime() : 0;

  return Number.isNaN(time) ? 0 : time;
};

const sortNewestFirst = (records) =>
  [...records].sort(
    (first, second) =>
      getCreatedTime(second) - getCreatedTime(first)
  );

const extractArray = (payload, possibleKeys = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  for (const key of possibleKeys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  if (payload.data && typeof payload.data === "object") {
    for (const key of possibleKeys) {
      if (Array.isArray(payload.data[key])) {
        return payload.data[key];
      }
    }

    if (Array.isArray(payload.data.data)) {
      return payload.data.data;
    }
  }

  return [];
};

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const isCreatedToday = (record) => {
  const value =
    record?.createdAt ||
    record?.created_at ||
    record?.registeredAt;

  if (!value) {
    return false;
  }

  const createdDate = new Date(value);
  const currentDate = new Date();

  return (
    createdDate.getDate() === currentDate.getDate() &&
    createdDate.getMonth() === currentDate.getMonth() &&
    createdDate.getFullYear() === currentDate.getFullYear()
  );
};

const getStatus = (record) =>
  normalizeText(
    record?.approvalStatus ||
      record?.status ||
      record?.verificationStatus
  );

const isPending = (record) => {
  const status = getStatus(record);

  return [
    "pending",
    "pending approval",
    "under review",
    "submitted",
  ].includes(status);
};

const isApproved = (record) => {
  const status = getStatus(record);

  return [
    "approved",
    "active",
    "verified",
    "confirmed",
    "completed",
  ].includes(status);
};

const getAuthToken = () => {
  const directToken =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

  if (directToken) {
    return directToken.replace(/^"|"$/g, "");
  }

  const storedAuth =
    localStorage.getItem("ETN_USER") ||
    localStorage.getItem("auth") ||
    localStorage.getItem("user") ||
    localStorage.getItem("currentUser");

  if (!storedAuth) {
    return "";
  }

  try {
    const parsed = JSON.parse(storedAuth);

    return (
      parsed?.token ||
      parsed?.accessToken ||
      parsed?.authToken ||
      parsed?.user?.token ||
      ""
    );
  } catch {
    return "";
  }
};

const buildApiUrl = (endpoint) => {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  const baseUrl = String(BACKEND_API || "").replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  if (!baseUrl) {
    return cleanEndpoint;
  }

  if (
    baseUrl.endsWith("/api") &&
    cleanEndpoint.startsWith("/api/")
  ) {
    return `${baseUrl}${cleanEndpoint.slice(4)}`;
  }

  return `${baseUrl}${cleanEndpoint}`;
};

function StatusBadge({ record }) {
  const status =
    record?.approvalStatus ||
    record?.status ||
    record?.verificationStatus ||
    "Pending";

  const normalizedStatus = normalizeText(status);

  let style =
    "bg-amber-50 text-amber-700 border-amber-200";

  if (
    ["approved", "active", "verified", "confirmed"].includes(
      normalizedStatus
    )
  ) {
    style =
      "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    ["rejected", "cancelled", "inactive", "blocked"].includes(
      normalizedStatus
    )
  ) {
    style = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${style}`}
    >
      {String(status).replace(/_/g, " ")}
    </span>
  );
}

function EmptyTableRow({ message, columns }) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="px-6 py-14 text-center"
      >
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-300" />

        <p className="font-bold text-slate-600">{message}</p>

        <p className="mt-1 text-sm text-slate-400">
          Only records created in the live database will appear
          here.
        </p>
      </td>
    </tr>
  );
}

export default function SuperAdminControlCenter() {
  const { currentUser, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Always start empty. Do not restore dashboard data from
  // localStorage.
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadCompleted, setInitialLoadCompleted] =
    useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const token = getAuthToken();

    const headers = new Headers(options.headers || {});

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorData = await response.json();

        errorMessage =
          errorData?.message ||
          errorData?.error ||
          errorMessage;
      } catch {
        // Response did not contain JSON.
      }

      const requestError = new Error(errorMessage);
      requestError.status = response.status;

      throw requestError;
    }

    if (response.status === 204) {
      return null;
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return null;
  }, []);

  const requestFirstAvailableEndpoint = useCallback(
    async (endpoints) => {
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          return await apiFetch(endpoint);
        } catch (requestError) {
          lastError = requestError;

          if (
            requestError.status !== 404 &&
            requestError.status !== 405
          ) {
            throw requestError;
          }
        }
      }

      return [];
    },
    [apiFetch]
  );

  const fetchLiveData = useCallback(
    async ({ background = false } = {}) => {
      if (background) {
        setRefreshing(true);
      } else if (!initialLoadCompleted) {
        setLoading(true);
      }

      setError("");

      try {
        const [
          usersData,
          propertiesData,
          vehiclesData,
          bookingsData,
        ] = await Promise.all([
          requestFirstAvailableEndpoint(["/api/users"]),
          requestFirstAvailableEndpoint(["/api/properties"]),
          requestFirstAvailableEndpoint(["/api/vehicles"]),
          requestFirstAvailableEndpoint(["/api/bookings"]),
        ]);

        const nextUsers = sortNewestFirst(
          extractArray(usersData, USER_ARRAY_KEYS)
        );

        const nextProperties = sortNewestFirst(
          extractArray(propertiesData, PROPERTY_ARRAY_KEYS)
        );

        const nextVehicles = sortNewestFirst(
          extractArray(vehiclesData, VEHICLE_ARRAY_KEYS)
        );

        const nextBookings = sortNewestFirst(
          extractArray(bookingsData, BOOKING_ARRAY_KEYS)
        );

        setUsers(nextUsers);
        setProperties(nextProperties);
        setVehicles(nextVehicles);
        setBookings(nextBookings);

        const confirmedRevenue = nextBookings.reduce(
          (total, booking) => {
            const paymentStatus = normalizeText(
              booking?.paymentStatus
            );

            const bookingStatus = normalizeText(
              booking?.status
            );

            const shouldCountRevenue =
              ["paid", "captured", "completed"].includes(
                paymentStatus
              ) ||
              ["confirmed", "completed"].includes(
                bookingStatus
              );

            if (!shouldCountRevenue) {
              return total;
            }

            return (
              total +
              Number(
                booking?.totalAmount ||
                  booking?.amount ||
                  booking?.grandTotal ||
                  booking?.totalPrice ||
                  0
              )
            );
          },
          0
        );

        setStats({
          totalUsers: nextUsers.length,
          newUsers: nextUsers.filter(isCreatedToday).length,

          totalProperties: nextProperties.length,
          pendingProperties:
            nextProperties.filter(isPending).length,
          approvedProperties:
            nextProperties.filter(isApproved).length,

          totalVehicles: nextVehicles.length,
          pendingVehicles:
            nextVehicles.filter(isPending).length,
          approvedVehicles:
            nextVehicles.filter(isApproved).length,

          totalBookings: nextBookings.length,
          pendingBookings:
            nextBookings.filter(isPending).length,

          totalRevenue: confirmedRevenue,
        });

        setLastUpdated(new Date());
      } catch (requestError) {
        console.warn("Live dashboard sync notice:", requestError);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoadCompleted(true);
      }
    },
    [
      initialLoadCompleted,
      requestFirstAvailableEndpoint,
    ]
  );

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const liveEvents = [
      "stats_updated",
      "dashboard_updated",

      "new_user_registered",
      "user_created",
      "user_updated",
      "user_deleted",
      "user_activated",
      "user_role_updated",

      "new_property",
      "property_created",
      "property_updated",
      "property_approved",
      "property_rejected",
      "property_deleted",

      "new_vehicle",
      "vehicle_created",
      "vehicle_updated",
      "vehicle_approved",
      "vehicle_rejected",
      "vehicle_deleted",

      "new_booking",
      "booking_created",
      "booking_updated",
      "booking_cancelled",
    ];

    const handleLiveUpdate = () => {
      fetchLiveData({ background: true });
    };

    liveEvents.forEach((eventName) => {
      socket.on(eventName, handleLiveUpdate);
    });

    return () => {
      liveEvents.forEach((eventName) => {
        socket.off(eventName, handleLiveUpdate);
      });
    };
  }, [socket, fetchLiveData]);

  // Poll as a fallback when a socket event is missed.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchLiveData({ background: true });
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchLiveData]);

  // Refresh when the user returns to the browser tab.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLiveData({ background: true });
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchLiveData]);

  const filteredUsers = useMemo(() => {
    const search = normalizeText(searchTerm);

    if (!search) {
      return users;
    }

    return users.filter((user) =>
      [
        user?.fullName,
        user?.name,
        user?.email,
        user?.phone,
        user?.role,
      ].some((value) =>
        normalizeText(value).includes(search)
      )
    );
  }, [users, searchTerm]);

  const filteredProperties = useMemo(() => {
    const search = normalizeText(searchTerm);

    if (!search) {
      return properties;
    }

    return properties.filter((property) =>
      [
        property?.title,
        property?.name,
        property?.propertyType,
        property?.type,
        property?.location?.city,
        property?.location?.district,
        property?.location?.address,
        property?.city,
        property?.district,
      ].some((value) =>
        normalizeText(value).includes(search)
      )
    );
  }, [properties, searchTerm]);

  const filteredVehicles = useMemo(() => {
    const search = normalizeText(searchTerm);

    if (!search) {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      [
        vehicle?.title,
        vehicle?.name,
        vehicle?.vehicleName,
        vehicle?.vehicleType,
        vehicle?.type,
        vehicle?.registrationNumber,
        vehicle?.registrationNo,
        vehicle?.providerName,
      ].some((value) =>
        normalizeText(value).includes(search)
      )
    );
  }, [vehicles, searchTerm]);

  const recentActivity = useMemo(() => {
    const userActivity = users.map((user) => ({
      id: `user-${getRecordId(user)}`,
      type: "user",
      title:
        user?.fullName ||
        user?.name ||
        user?.email ||
        "New user",
      description: "A new user account was created",
      createdAt:
        user?.createdAt ||
        user?.created_at ||
        user?.registeredAt,
    }));

    const propertyActivity = properties.map((property) => ({
      id: `property-${getRecordId(property)}`,
      type: "property",
      title:
        property?.title ||
        property?.name ||
        "New property",
      description: "A new property was submitted",
      createdAt:
        property?.createdAt || property?.created_at,
    }));

    const vehicleActivity = vehicles.map((vehicle) => ({
      id: `vehicle-${getRecordId(vehicle)}`,
      type: "vehicle",
      title:
        vehicle?.title ||
        vehicle?.vehicleName ||
        vehicle?.name ||
        "New vehicle",
      description: "A new vehicle was submitted",
      createdAt:
        vehicle?.createdAt || vehicle?.created_at,
    }));

    return sortNewestFirst([
      ...userActivity,
      ...propertyActivity,
      ...vehicleActivity,
    ]).slice(0, 10);
  }, [users, properties, vehicles]);

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      count: null,
    },
    {
      id: "users",
      label: "Live Users",
      icon: Users,
      count: stats.totalUsers,
    },
    {
      id: "properties",
      label: "Live Properties",
      icon: Building2,
      count: stats.totalProperties,
    },
    {
      id: "vehicles",
      label: "Live Vehicles",
      icon: Car,
      count: stats.totalVehicles,
    },
  ];

  const statCards = [
    {
      label: "Live Users",
      value: stats.totalUsers,
      subText: `${stats.newUsers} created today`,
      icon: Users,
      style:
        "border-blue-200 bg-gradient-to-br from-blue-50 to-white",
      iconStyle: "bg-blue-600 text-white",
    },
    {
      label: "Live Properties",
      value: stats.totalProperties,
      subText: `${stats.pendingProperties} awaiting approval`,
      icon: Building2,
      style:
        "border-violet-200 bg-gradient-to-br from-violet-50 to-white",
      iconStyle: "bg-violet-600 text-white",
    },
    {
      label: "Live Vehicles",
      value: stats.totalVehicles,
      subText: `${stats.pendingVehicles} awaiting approval`,
      icon: Car,
      style:
        "border-orange-200 bg-gradient-to-br from-orange-50 to-white",
      iconStyle: "bg-orange-500 text-white",
    },
    {
      label: "Live Bookings",
      value: stats.totalBookings,
      subText: `${stats.pendingBookings} pending`,
      icon: CalendarDays,
      style:
        "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white",
      iconStyle: "bg-emerald-600 text-white",
    },
    {
      label: "Confirmed Revenue",
      value: formatMoney(stats.totalRevenue),
      subText: "From paid or confirmed bookings",
      icon: IndianRupee,
      style:
        "border-cyan-200 bg-gradient-to-br from-cyan-50 to-white",
      iconStyle: "bg-cyan-600 text-white",
    },
  ];

  const openTab = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm("");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutError) {
      console.error("Logout error:", logoutError);
    }
  };

  const renderLoading = () => (
    <div className="flex min-h-[430px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-600" />

        <p className="mt-4 font-extrabold text-slate-800">
          Loading live database records
        </p>

        <p className="mt-1 text-sm text-slate-500">
          No cached or default entries are being used.
        </p>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className={`rounded-3xl border p-5 shadow-sm ${card.style}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    {card.label}
                  </p>

                  <h3 className="mt-2 text-3xl font-black text-slate-900">
                    {card.value}
                  </h3>
                </div>

                <div
                  className={`rounded-2xl p-3 ${card.iconStyle}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-500">
                {card.subText}
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Latest live records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Users, properties and vehicles created in the
                database
              </p>
            </div>

            <Activity className="h-5 w-5 text-cyan-600" />
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Clock3 className="mx-auto h-9 w-9 text-slate-300" />

                <p className="mt-3 font-bold text-slate-600">
                  No live activity available
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  New database records will appear here.
                </p>
              </div>
            ) : (
              recentActivity.map((activity) => {
                let Icon = Users;
                let iconStyle = "bg-blue-50 text-blue-600";

                if (activity.type === "property") {
                  Icon = Building2;
                  iconStyle =
                    "bg-violet-50 text-violet-600";
                }

                if (activity.type === "vehicle") {
                  Icon = Car;
                  iconStyle =
                    "bg-orange-50 text-orange-600";
                }

                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div
                      className={`rounded-2xl p-3 ${iconStyle}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-extrabold text-slate-800">
                        {activity.title}
                      </p>

                      <p className="text-sm text-slate-500">
                        {activity.description}
                      </p>
                    </div>

                    <p className="hidden text-xs font-semibold text-slate-400 sm:block">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-black text-slate-900">
                Live synchronization
              </h2>

              <p className="text-sm text-slate-500">
                Current connection information
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
              <span className="text-sm font-bold text-slate-600">
                Socket connection
              </span>

              <span
                className={`flex items-center gap-2 text-sm font-extrabold ${
                  isConnected
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isConnected
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />

                {isConnected
                  ? "Connected"
                  : "Polling active"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
              <span className="text-sm font-bold text-slate-600">
                Last updated
              </span>

              <span className="text-right text-sm font-extrabold text-slate-800">
                {lastUpdated
                  ? lastUpdated.toLocaleTimeString("en-IN")
                  : "Waiting"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
              <span className="text-sm font-bold text-slate-600">
                Data source
              </span>

              <span className="text-sm font-extrabold text-cyan-700">
                Backend API only
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchLiveData({ background: true })
            }
            disabled={refreshing}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Refresh live data
          </button>
        </section>
      </div>
    </div>
  );

  const renderUsers = () => (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-xl font-black text-slate-900">
          Live registered users
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Showing only user accounts returned by the backend
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <EmptyTableRow
                columns={5}
                message="No live users found"
              />
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={getRecordId(user)}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-slate-800">
                      {user?.fullName ||
                        user?.name ||
                        "Unnamed user"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {user?.email || "No email"}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                    {user?.phone ||
                      user?.mobileNumber ||
                      user?.mobile ||
                      "Not provided"}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">
                      {String(user?.role || "user").replace(
                        /_/g,
                        " "
                      )}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(
                      user?.createdAt ||
                        user?.created_at ||
                        user?.registeredAt
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge
                      record={{
                        status:
                          user?.status ||
                          (user?.isActive === false
                            ? "Inactive"
                            : user?.isVerified
                              ? "Verified"
                              : "Active"),
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderProperties = () => (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-xl font-black text-slate-900">
          Live properties
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Showing only properties stored in the live database
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Property</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Approval</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredProperties.length === 0 ? (
              <EmptyTableRow
                columns={6}
                message="No live properties found"
              />
            ) : (
              filteredProperties.map((property) => {
                const location =
                  property?.location?.city ||
                  property?.city ||
                  property?.location?.district ||
                  property?.district ||
                  property?.location?.address ||
                  "Not provided";

                return (
                  <tr
                    key={getRecordId(property)}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-800">
                        {property?.title ||
                          property?.name ||
                          "Unnamed property"}
                      </p>

                      <p className="text-xs text-slate-400">
                        ID: {getRecordId(property)}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-slate-600">
                      {property?.propertyType ||
                        property?.type ||
                        "Not provided"}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {location}
                    </td>

                    <td className="px-6 py-4 font-extrabold text-slate-800">
                      {formatMoney(
                        property?.pricePerNight ||
                          property?.price ||
                          property?.rentPerDay
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(
                        property?.createdAt ||
                          property?.created_at
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge record={property} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderVehicles = () => (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-xl font-black text-slate-900">
          Live vehicles
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Showing only vehicles stored in the live database
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Registration</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Approval</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredVehicles.length === 0 ? (
              <EmptyTableRow
                columns={6}
                message="No live vehicles found"
              />
            ) : (
              filteredVehicles.map((vehicle) => (
                <tr
                  key={getRecordId(vehicle)}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <p className="font-extrabold text-slate-800">
                      {vehicle?.title ||
                        vehicle?.vehicleName ||
                        vehicle?.name ||
                        "Unnamed vehicle"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {vehicle?.vehicleType ||
                        vehicle?.type ||
                        "Type not provided"}
                    </p>
                  </td>

                  <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">
                    {vehicle?.registrationNumber ||
                      vehicle?.registrationNo ||
                      vehicle?.regNo ||
                      "Not provided"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {vehicle?.providerName ||
                      vehicle?.owner?.fullName ||
                      vehicle?.ownerName ||
                      "Not provided"}
                  </td>

                  <td className="px-6 py-4 font-extrabold text-slate-800">
                    {formatMoney(
                      vehicle?.pricePerDay ||
                        vehicle?.rentPerDay ||
                        vehicle?.price
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(
                      vehicle?.createdAt ||
                        vehicle?.created_at
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge record={vehicle} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderContent = () => {
    if (loading && !initialLoadCompleted) {
      return renderLoading();
    }

    if (activeTab === "users") {
      return renderUsers();
    }

    if (activeTab === "properties") {
      return renderProperties();
    }

    if (activeTab === "vehicles") {
      return renderVehicles();
    }

    return renderOverview();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500 p-2.5 text-slate-950">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="font-black">Super Admin</h1>

              <p className="text-xs font-semibold text-slate-400">
                Live control center
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-extrabold transition ${
                  active
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />

                <span className="flex-1">{item.label}</span>

                {item.count !== null && (
                  <span
                    className={`min-w-7 rounded-full px-2 py-1 text-center text-xs ${
                      active
                        ? "bg-slate-950 text-white"
                        : "bg-white/10 text-cyan-300"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-2xl bg-white/5 p-4">
            <p className="truncate font-extrabold text-white">
              {currentUser?.fullName ||
                currentUser?.name ||
                "Super Admin"}
            </p>

            <p className="mt-1 truncate text-xs text-slate-400">
              {currentUser?.email || "Administrator"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-extrabold text-red-300 transition hover:bg-red-500 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-black capitalize text-slate-900">
                {activeTab === "overview"
                  ? "Live dashboard"
                  : `Live ${activeTab}`}
              </h2>

              <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />

                {isConnected
                  ? "Real-time socket connected"
                  : "Automatic API refresh active"}
              </div>
            </div>

            {activeTab !== "overview" && (
              <div className="relative hidden w-full max-w-sm sm:block">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder={`Search ${activeTab}...`}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                fetchLiveData({ background: true })
              }
              disabled={refreshing}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-50"
              title="Refresh live data"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>

            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 md:flex">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 font-black text-white">
                {(
                  currentUser?.fullName ||
                  currentUser?.name ||
                  "S"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="max-w-40">
                <p className="truncate text-sm font-extrabold text-slate-800">
                  {currentUser?.fullName ||
                    currentUser?.name ||
                    "Super Admin"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {stats.totalUsers} users ·{" "}
                  {stats.totalProperties} properties ·{" "}
                  {stats.totalVehicles} vehicles
                </p>
              </div>
            </div>
          </div>

          {activeTab !== "overview" && (
            <div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder={`Search ${activeTab}...`}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="flex-1">
                <p className="font-extrabold">
                  Live-data warning
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-amber-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {!error && initialLoadCompleted && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5">
              <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />

                Dashboard contains backend records only
              </div>

              <p className="text-xs font-bold text-emerald-600">
                Last sync:{" "}
                {lastUpdated
                  ? lastUpdated.toLocaleString("en-IN")
                  : "Waiting"}
              </p>
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  );
}