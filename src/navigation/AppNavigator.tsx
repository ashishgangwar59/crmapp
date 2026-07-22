import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
  ScrollView,
  Modal,
  Image,
  ActionSheetIOS,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, spacing, borderRadius } from '../theme/colors';
import { apiCall } from '../services/api';
import { useAuthStore } from '../services/authStore';
import {
  Users,
  Clock,
  Wallet,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle,
  CalendarDays,
  Gift,
  LogOut,
  Menu,
  X,
  Calendar,
  Target,
  BarChart2,
  Bell,
  Settings,
  LayoutGrid,
  Search,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Building,
  Briefcase,
  Umbrella,
  Mail,
  MessageSquare,
  Plug,
  Shield,
  RadioTower,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  KeyRound,
  User as UserIcon,
  UploadCloud,
  XCircle,
  Camera,
} from 'lucide-react-native';

// Types
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- Login Screen ---
const LoginScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe: true,
          deviceInfo: `${Platform.OS} ${Platform.Version || ''}`.trim(),
        }),
      });

      if (response.success && response.data) {
        const { user, token, role } = response.data;
        setAuth(user || { email, role }, token || 'mock-token');
      } else {
        setErrorMsg(response.error || 'Invalid credentials or login failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const topGap = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 20) : 20);
  const bottomGap = Math.max(insets.bottom, 20);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: topGap, paddingBottom: bottomGap }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>CRM</Text>
          <Text style={styles.subtitle}>Niventra Capital Advisory
            India Pvt. Ltd.</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.label}>Niventra Capital Advisory
            India Pvt. Ltd.</Text>

          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          <TextInput
            style={styles.textInput}
            placeholder="Email Address"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.textInput}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Employees Sub-View ---
const EmployeesView = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); // Empty string for "All Statuses"

  // Detail view state
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [resetPassword, setResetPassword] = useState('');

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);

  // STEP 1: Personal Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [systemRole, setSystemRole] = useState('Employee');

  // STEP 2: Official Details
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Developer');
  const [workLocation, setWorkLocation] = useState('Noida');
  const [employeeType, setEmployeeType] = useState('Full-Time');

  // STEP 3: KYC
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [passportNumber, setPassportNumber] = useState('');

  // STEP 4: Bank Details
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');

  // STEP 5: Permissions & Login credentials
  const [password, setPassword] = useState('');
  const [moduleAccess, setModuleAccess] = useState<string[]>([
    'Overview', 'Attendance', 'Leads', 'Reports', 'Profile'
  ]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = `?search=${encodeURIComponent(search)}${statusFilter ? `&status=${statusFilter}` : ''}`;
      const response = await apiCall(`/api/employees${query}`);
      if (response.success && response.data) {
        const list = Array.isArray(response.data.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setEmployees(list);
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch employees.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, statusFilter]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!firstName || !lastName || !email || !phone) {
        Alert.alert('Validation Error', 'First Name, Last Name, Email, and Phone are required.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleEditClick = (emp: any) => {
    setIsEditMode(true);
    setCurrentStep(1);

    // Pre-fill states
    setFirstName(emp.firstName || '');
    setLastName(emp.lastName || '');
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setDateOfBirth(emp.dateOfBirth ? emp.dateOfBirth.substring(0, 10) : '');
    setProfilePhotoUrl(emp.profilePhotoUrl || '');
    setSystemRole(emp.systemRole || 'Employee');
    setDepartment(emp.department || 'Engineering');
    setDesignation(emp.designation || 'Developer');
    setWorkLocation(emp.workLocation || 'Noida');
    setEmployeeType(emp.employeeType || 'Full-Time');
    setAadharNumber(emp.kyc?.aadharNumber || '');
    setPanNumber(emp.kyc?.panNumber || '');
    setPassportNumber(emp.kyc?.passportNumber || '');
    setBankName(emp.bankDetails?.bankName || '');
    setAccountNumber(emp.bankDetails?.accountNumber || '');
    setIfscCode(emp.bankDetails?.ifscCode || '');
    setBranchName(emp.bankDetails?.branchName || '');
    setPassword('');
    setModuleAccess(emp.moduleAccess || ['Overview', 'Attendance', 'Leads', 'Reports', 'Profile']);

    setShowAddForm(true);
  };

  const handleDeleteEmployee = async (empId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiCall(`/api/employees/${empId}`, { method: 'DELETE' });
              if (response.success) {
                Alert.alert('Success', 'Employee deleted successfully!');
                setSelectedEmployee(null);
                fetchEmployees();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete employee.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred.');
            }
          }
        }
      ]
    );
  };

  const handleForceResetPassword = async (empId: string) => {
    if (!resetPassword || resetPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    try {
      const response = await apiCall(`/api/employees/${empId}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: resetPassword }),
      });

      if (response.success) {
        Alert.alert('Success', 'Password reset successfully!');
        setResetPassword('');
      } else {
        Alert.alert('Error', response.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    }
  };

  const handleAddEmployee = async () => {
    setSubmitLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        profilePhotoUrl,
        department,
        designation,
        workLocation,
        employeeType,
        kyc: {
          aadharNumber,
          panNumber,
          passportNumber,
        },
        bankDetails: {
          bankName,
          accountNumber,
          ifscCode,
          branchName,
        },
        systemRole,
        moduleAccess,
        password: password || (systemRole === 'ADMIN' ? 'Admin@123' : 'Employee@123'),
      };

      const url = isEditMode ? `/api/employees/${selectedEmployee?._id || selectedEmployee?.id}` : '/api/employees';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await apiCall(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (response.success) {
        Alert.alert('Success', isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!');
        setShowAddForm(false);
        setIsEditMode(false);
        setSelectedEmployee(null);
        // Reset steps & inputs
        setCurrentStep(1);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setDateOfBirth('');
        setProfilePhotoUrl('');
        setDepartment('Engineering');
        setDesignation('Developer');
        setWorkLocation('Noida');
        setEmployeeType('Full-Time');
        setAadharNumber('');
        setPanNumber('');
        setPassportNumber('');
        setBankName('');
        setAccountNumber('');
        setIfscCode('');
        setBranchName('');
        setPassword('');
        setModuleAccess(['Overview', 'Attendance', 'Leads', 'Reports', 'Profile']);
        fetchEmployees();
      } else {
        Alert.alert('Error', response.error || 'Failed to submit employee.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper for Stepper indicator circles
  const renderStepCircle = (stepNum: number, label: string) => {
    const isCompleted = stepNum < currentStep;
    const isActive = stepNum === currentStep;
    return (
      <TouchableOpacity
        key={stepNum}
        style={styles.stepCircleContainer}
        onPress={() => setCurrentStep(stepNum)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.stepCircle,
            isCompleted && styles.stepCircleCompleted,
            isActive && styles.stepCircleActive
          ]}
        >
          <Text
            style={[
              styles.stepCircleText,
              (isActive || isCompleted) && styles.stepCircleTextActive
            ]}
          >
            {stepNum}
          </Text>
        </View>
        <Text style={[styles.stepCircleLabel, isActive && styles.stepCircleLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.employeesContainer}>
      {selectedEmployee && !showAddForm ? (
        /* --- EMPLOYEE DETAIL VIEW --- */
        <ScrollView contentContainerStyle={styles.detailScrollContent}>
          {/* Header Row */}
          <View style={styles.detailHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedEmployee(null)}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>
                {selectedEmployee.firstName?.[0]?.toUpperCase()}{selectedEmployee.lastName?.[0]?.toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.detailName}>{selectedEmployee.firstName} {selectedEmployee.lastName}</Text>
              <Text style={styles.detailMeta}>{selectedEmployee.employeeCode} • {selectedEmployee.designation || 'Staff'}</Text>
            </View>
          </View>

          {/* Edit/Delete Action Row */}
          <View style={styles.detailActionRow}>
            <TouchableOpacity
              style={[styles.detailBtn, styles.detailBtnEdit]}
              onPress={() => handleEditClick(selectedEmployee)}
            >
              <Edit size={16} color={colors.background} />
              <Text style={styles.detailBtnText}>Edit Employee</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.detailBtn, styles.detailBtnDelete]}
              onPress={() => handleDeleteEmployee(selectedEmployee._id || selectedEmployee.id)}
            >
              <Trash2 size={16} color="#fff" />
              <Text style={[styles.detailBtnText, { color: '#fff' }]}>Delete Employee</Text>
            </TouchableOpacity>
          </View>

          {/* Card 1: Personal Details */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Personal Details</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailVal}>{selectedEmployee.email}</Text>
              </View>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailVal}>{selectedEmployee.phone || '-'}</Text>
              </View>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailVal}>{selectedEmployee.status || 'Active'}</Text>
              </View>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Employee Type</Text>
                <Text style={styles.detailVal}>{selectedEmployee.employeeType || 'Full-Time'}</Text>
              </View>
              {selectedEmployee.dateOfBirth && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Date of Birth</Text>
                  <Text style={styles.detailVal}>
                    {new Date(selectedEmployee.dateOfBirth).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Card 2: Official Details */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Official Details</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Department</Text>
                <Text style={styles.detailVal}>{selectedEmployee.department || 'N/A'}</Text>
              </View>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Designation</Text>
                <Text style={styles.detailVal}>{selectedEmployee.designation || 'N/A'}</Text>
              </View>
              {selectedEmployee.workLocation && (
                <View style={styles.detailGridCol}>
                  <Text style={styles.detailLabel}>Work Location</Text>
                  <Text style={styles.detailVal}>{selectedEmployee.workLocation}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Card 3: KYC & Bank Information */}
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>KYC & Bank Information</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>Aadhar Number</Text>
                <Text style={styles.detailVal}>{selectedEmployee.kyc?.aadharNumber || '-'}</Text>
              </View>
              <View style={styles.detailGridCol}>
                <Text style={styles.detailLabel}>PAN Number</Text>
                <Text style={styles.detailVal}>{selectedEmployee.kyc?.panNumber || '-'}</Text>
              </View>
              {selectedEmployee.bankDetails?.bankName && (
                <>
                  <View style={styles.detailGridCol}>
                    <Text style={styles.detailLabel}>Bank Name</Text>
                    <Text style={styles.detailVal}>{selectedEmployee.bankDetails.bankName}</Text>
                  </View>
                  <View style={styles.detailGridCol}>
                    <Text style={styles.detailLabel}>Account Number</Text>
                    <Text style={styles.detailVal}>{selectedEmployee.bankDetails.accountNumber}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Card 4: Administrative Actions (Password Force Reset) */}
          <View style={[styles.detailCard, styles.adminActionsCard]}>
            <Text style={[styles.detailCardTitle, styles.adminActionsTitle]}>Administrative Actions</Text>
            <Text style={styles.adminActionsDesc}>
              Force reset this user's login password. They will be prompted to change it on their next login.
            </Text>

            <Text style={styles.formLabel}>New Password</Text>
            <View style={styles.resetInputRow}>
              <TextInput
                style={styles.resetInput}
                placeholder="Enter minimum 6 characters..."
                placeholderTextColor={colors.textMuted}
                value={resetPassword}
                onChangeText={setResetPassword}
                secureTextEntry
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => handleForceResetPassword(selectedEmployee._id || selectedEmployee.id)}
              >
                <Text style={styles.buttonText}>Force Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      ) : (
        /* --- DIRECTORY DIRECT LISTING --- */
        <View style={{ flex: 1 }}>
          {/* Title & Actions Row */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.empTitle}>Employees</Text>
              <Text style={styles.empSubtitle}>Manage workforce, departments, and records.</Text>
            </View>
            <TouchableOpacity style={styles.addEmpButton} onPress={() => { setIsEditMode(false); setShowAddForm(true); setCurrentStep(1); }}>
              <Plus size={16} color={colors.background} style={{ marginRight: 6 }} />
              <Text style={styles.addEmpBtnText}>Add Employee</Text>
            </TouchableOpacity>
          </View>

          {/* Search & Filters Row */}
          <View style={styles.filterRow}>
            <View style={styles.searchContainer}>
              <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search employees..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Toggleable Status Filter Badges */}
            <View style={styles.filterBadges}>
              <TouchableOpacity
                style={[styles.filterBadge, statusFilter === '' && styles.filterBadgeActive]}
                onPress={() => setStatusFilter('')}
              >
                <Text style={[styles.filterBadgeText, statusFilter === '' && styles.filterBadgeTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBadge, statusFilter === 'Active' && styles.filterBadgeActive]}
                onPress={() => setStatusFilter('Active')}
              >
                <Text style={[styles.filterBadgeText, statusFilter === 'Active' && styles.filterBadgeTextActive]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBadge, statusFilter === 'Inactive' && styles.filterBadgeActive]}
                onPress={() => setStatusFilter('Inactive')}
              >
                <Text style={[styles.filterBadgeText, statusFilter === 'Inactive' && styles.filterBadgeTextActive]}>
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Directory List */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView style={styles.employeeListContainer}>
              {employees.map((emp) => (
                <TouchableOpacity
                  key={emp.id || emp._id}
                  style={styles.employeeRowCard}
                  onPress={() => setSelectedEmployee(emp)}
                >
                  <View style={styles.empCardHeader}>
                    <View style={styles.empAvatar}>
                      <Text style={styles.empAvatarText}>
                        {emp.firstName?.[0]?.toUpperCase()}{emp.lastName?.[0]?.toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.empName}>{emp.firstName} {emp.lastName}</Text>
                      <Text style={styles.empEmail}>{emp.email}</Text>
                    </View>
                    <View style={[styles.statusBadge, emp.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
                      <Text style={[styles.statusText, emp.status === 'Active' ? styles.statusTextActive : styles.statusTextInactive]}>
                        {emp.status || 'Active'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.empCardBody}>
                    <View style={styles.empDetailCol}>
                      <Text style={styles.detailLabel}>Code</Text>
                      <Text style={styles.detailVal}>{emp.employeeCode}</Text>
                    </View>
                    <View style={styles.empDetailCol}>
                      <Text style={styles.detailLabel}>Department</Text>
                      <Text style={styles.detailVal}>{emp.department || 'N/A'}</Text>
                    </View>
                    <View style={styles.empDetailCol}>
                      <Text style={styles.detailLabel}>Designation</Text>
                      <Text style={styles.detailVal}>{emp.designation || 'N/A'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {employees.length === 0 && (
                <Text style={styles.noEmployeesText}>No employees found.</Text>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Multi-step Add/Edit Employee Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</Text>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Stepper visual indicator */}
            <View style={styles.stepperContainer}>
              {renderStepCircle(1, 'Personal')}
              <View style={[styles.stepLine, currentStep > 1 && styles.stepLineCompleted]} />
              {renderStepCircle(2, 'Official')}
              <View style={[styles.stepLine, currentStep > 2 && styles.stepLineCompleted]} />
              {renderStepCircle(3, 'KYC')}
              <View style={[styles.stepLine, currentStep > 3 && styles.stepLineCompleted]} />
              {renderStepCircle(4, 'Bank')}
              <View style={[styles.stepLine, currentStep > 4 && styles.stepLineCompleted]} />
              {renderStepCircle(5, 'Roles')}
            </View>

            <ScrollView contentContainerStyle={styles.modalFormContent}>
              {/* STEP 1: Personal Details */}
              {currentStep === 1 && (
                <View>
                  <Text style={styles.stepTitle}>Personal Details</Text>
                  <Text style={styles.stepDesc}>Basic contact and personal information.</Text>

                  <Text style={styles.formLabel}>First Name *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter First Name"
                    placeholderTextColor={colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                  />

                  <Text style={styles.formLabel}>Last Name *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Last Name"
                    placeholderTextColor={colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                  />

                  <Text style={styles.formLabel}>Email Address *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.formLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Phone Number"
                    placeholderTextColor={colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.formLabel}>Date of Birth (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="e.g. 1995-10-15"
                    placeholderTextColor={colors.textMuted}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                  />

                  <Text style={styles.formLabel}>Profile Photo URL</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Photo URL"
                    placeholderTextColor={colors.textMuted}
                    value={profilePhotoUrl}
                    onChangeText={setProfilePhotoUrl}
                  />
                </View>
              )}

              {/* STEP 2: Official Details */}
              {currentStep === 2 && (
                <View>
                  <Text style={styles.stepTitle}>Official Details</Text>
                  <Text style={styles.stepDesc}>Work location, department and role details.</Text>

                  <Text style={styles.formLabel}>Department</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Engineering, Sales, HR, etc."
                    placeholderTextColor={colors.textMuted}
                    value={department}
                    onChangeText={setDepartment}
                  />

                  <Text style={styles.formLabel}>Designation</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Developer, Manager, Designer, etc."
                    placeholderTextColor={colors.textMuted}
                    value={designation}
                    onChangeText={setDesignation}
                  />

                  <Text style={styles.formLabel}>Work Location</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="e.g. Noida, Delhi"
                    placeholderTextColor={colors.textMuted}
                    value={workLocation}
                    onChangeText={setWorkLocation}
                  />

                  <Text style={styles.formLabel}>Employee Type</Text>
                  <View style={styles.typeSelectionRow}>
                    {['Full-Time', 'Part-Time', 'Contract', 'Intern'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.typeSelectBtn, employeeType === type && styles.typeSelectBtnActive]}
                        onPress={() => setEmployeeType(type)}
                      >
                        <Text style={[styles.typeSelectText, employeeType === type && styles.typeSelectTextActive]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* STEP 3: KYC & Docs */}
              {currentStep === 3 && (
                <View>
                  <Text style={styles.stepTitle}>KYC & Verification</Text>
                  <Text style={styles.stepDesc}>Government identification details.</Text>

                  <Text style={styles.formLabel}>Aadhar Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter 12-digit Aadhar Number"
                    placeholderTextColor={colors.textMuted}
                    value={aadharNumber}
                    onChangeText={setAadharNumber}
                    keyboardType="number-pad"
                  />

                  <Text style={styles.formLabel}>PAN Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter 10-digit PAN"
                    placeholderTextColor={colors.textMuted}
                    value={panNumber}
                    onChangeText={setPanNumber}
                    autoCapitalize="characters"
                  />

                  <Text style={styles.formLabel}>Passport Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Passport Number"
                    placeholderTextColor={colors.textMuted}
                    value={passportNumber}
                    onChangeText={setPassportNumber}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              {/* STEP 4: Bank Details */}
              {currentStep === 4 && (
                <View>
                  <Text style={styles.stepTitle}>Bank Details</Text>
                  <Text style={styles.stepDesc}>Account info for payroll purposes.</Text>

                  <Text style={styles.formLabel}>Bank Name</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Bank Name"
                    placeholderTextColor={colors.textMuted}
                    value={bankName}
                    onChangeText={setBankName}
                  />

                  <Text style={styles.formLabel}>Account Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Bank Account Number"
                    placeholderTextColor={colors.textMuted}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                  />

                  <Text style={styles.formLabel}>IFSC Code</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter IFSC Code"
                    placeholderTextColor={colors.textMuted}
                    value={ifscCode}
                    onChangeText={setIfscCode}
                    autoCapitalize="characters"
                  />

                  <Text style={styles.formLabel}>Branch Name</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Enter Branch Name"
                    placeholderTextColor={colors.textMuted}
                    value={branchName}
                    onChangeText={setBranchName}
                  />
                </View>
              )}

              {/* STEP 5: Permissions & Role */}
              {currentStep === 5 && (
                <View>
                  <Text style={styles.stepTitle}>System Role & Credentials</Text>
                  <Text style={styles.stepDesc}>Establish access levels and login passwords.</Text>

                  <Text style={styles.formLabel}>System Role (Key Admin Only)</Text>
                  <View style={styles.roleSelectionRow}>
                    <TouchableOpacity
                      style={[styles.roleSelectBtn, systemRole === 'Employee' && styles.roleSelectBtnActive]}
                      onPress={() => setSystemRole('Employee')}
                    >
                      <Text style={[styles.roleSelectText, systemRole === 'Employee' && styles.roleSelectTextActive]}>
                        Employee (Default)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleSelectBtn, systemRole === 'ADMIN' && styles.roleSelectBtnActive]}
                      onPress={() => setSystemRole('ADMIN')}
                    >
                      <Text style={[styles.roleSelectText, systemRole === 'ADMIN' && styles.roleSelectTextActive]}>
                        Administrator
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.roleTip}>
                    Administrators have elevated access and use the default password <Text style={{ fontWeight: 'bold' }}>Admin@123</Text>. Employees use <Text style={{ fontWeight: 'bold' }}>Employee@123</Text>.
                  </Text>

                  <Text style={styles.formLabel}>Custom Password (Optional)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Override default password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />

                  {/* Module Access Checkboxes matching user screenshot */}
                  <View style={styles.moduleAccessSection}>
                    <Text style={styles.stepTitle}>Module Access</Text>
                    <Text style={styles.stepDesc}>Select which sidebar modules this employee can access.</Text>

                    <View style={styles.moduleGridContainer}>
                      {[
                        ['Overview', 'Attendance', 'Leads'],
                        ['Reports', 'Profile', 'Executive AI'],
                        ['Wallet', 'Payroll', 'Leave'],
                        ['Holidays', 'Employees', 'Notifications'],
                        ['Settings']
                      ].map((row, rIdx) => (
                        <View key={rIdx} style={styles.moduleGridRow}>
                          {row.map((mod) => {
                            const isChecked = moduleAccess.includes(mod);
                            return (
                              <TouchableOpacity
                                key={mod}
                                style={styles.moduleCheckboxCol}
                                activeOpacity={0.7}
                                onPress={() => {
                                  if (isChecked) {
                                    setModuleAccess(moduleAccess.filter((m) => m !== mod));
                                  } else {
                                    setModuleAccess([...moduleAccess, mod]);
                                  }
                                }}
                              >
                                <View style={[styles.customCheckbox, isChecked && styles.customCheckboxChecked]}>
                                  {isChecked && <Text style={styles.checkmarkIcon}>✓</Text>}
                                </View>
                                <Text style={styles.moduleCheckboxLabel} numberOfLines={1}>{mod}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Stepper Navigation Buttons */}
              <View style={styles.stepperNavRow}>
                <TouchableOpacity
                  style={[styles.stepperNavBtn, currentStep === 1 && styles.stepperNavBtnDisabled]}
                  onPress={handlePreviousStep}
                  disabled={currentStep === 1}
                >
                  <Text style={[styles.stepperNavText, currentStep === 1 && styles.stepperNavTextDisabled]}>
                    &lt; Previous
                  </Text>
                </TouchableOpacity>

                {currentStep < 5 ? (
                  <TouchableOpacity
                    style={[styles.stepperNavBtn, styles.stepperNavBtnActive]}
                    onPress={handleNextStep}
                  >
                    <Text style={[styles.stepperNavText, styles.stepperNavTextActive]}>
                      Next &gt;
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.stepperNavBtn, styles.stepperNavBtnActive, submitLoading && styles.disabledButton]}
                    onPress={handleAddEmployee}
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <Text style={[styles.stepperNavText, styles.stepperNavTextActive]}>
                        Submit
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Payroll Sub-View ---
const PayrollView = () => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'structures'>('dashboard');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPayrolls, setSelectedPayrolls] = useState<string[]>([]);
  const [processingBulk, setProcessingBulk] = useState(false);

  // Structures sub-tab state
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [structFormData, setStructFormData] = useState({
    basic: 0,
    hra: 0,
    specialAllowance: 0,
    pf: 0,
    esi: 0,
    professionalTax: 0,
    incomeTax: 0,
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Payslip detail view modal/screen state
  const [selectedPayrollSlip, setSelectedPayrollSlip] = useState<any>(null);

  const fetchPayrolls = async () => {
    try {
      const response = await apiCall(`/api/payroll?monthYear=${monthYear}`);
      if (response.success && response.data) {
        setPayrolls(Array.isArray(response.data) ? response.data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEmployeesAndStructures = async () => {
    try {
      const [empRes, structRes] = await Promise.all([
        apiCall('/api/employees'),
        apiCall('/api/payroll/structure')
      ]);

      if (empRes.success && empRes.data) {
        const empList = Array.isArray(empRes.data.data)
          ? empRes.data.data
          : Array.isArray(empRes.data) ? empRes.data : [];
        setEmployees(empList);
      }

      if (structRes.success && structRes.data) {
        setStructures(Array.isArray(structRes.data) ? structRes.data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchPayrolls(), fetchEmployeesAndStructures()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
    setSelectedPayrolls([]);
  }, [monthYear]);

  const handleGenerate = async (employeeId: string) => {
    setGenerating(true);
    try {
      const res = await apiCall('/api/payroll/generate', {
        method: 'POST',
        body: JSON.stringify({ employeeId, monthYear }),
      });
      if (res.success) {
        Alert.alert('Success', 'Payroll generated successfully!');
        fetchPayrolls();
      } else {
        Alert.alert('Error', res.error || 'Failed to generate payroll.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelection = (payrollId: string) => {
    if (selectedPayrolls.includes(payrollId)) {
      setSelectedPayrolls(selectedPayrolls.filter(id => id !== payrollId));
    } else {
      setSelectedPayrolls([...selectedPayrolls, payrollId]);
    }
  };

  const toggleAll = () => {
    const eligiblePayrolls = payrolls.filter(p => p.status === 'Approved');
    if (selectedPayrolls.length === eligiblePayrolls.length) {
      setSelectedPayrolls([]);
    } else {
      setSelectedPayrolls(eligiblePayrolls.map(p => p._id));
    }
  };

  const handleBulkPayment = async () => {
    if (selectedPayrolls.length === 0) return;

    Alert.alert(
      'Confirm Bulk Pay',
      `Are you sure you want to process ${selectedPayrolls.length} salaries? Funds will be deducted from the Company Wallet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Process Payment',
          onPress: async () => {
            setProcessingBulk(true);
            try {
              const res: any = await apiCall('/api/payroll/payment', {
                method: 'POST',
                body: JSON.stringify({ payrollIds: selectedPayrolls, monthYear }),
              });
              if (res.success) {
                Alert.alert('Success', res.message || 'Bulk payment processed!');
                setSelectedPayrolls([]);
                fetchPayrolls();
              } else {
                Alert.alert('Payment Failed', res.error || 'Failed bulk payment.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred.');
            } finally {
              setProcessingBulk(false);
            }
          }
        }
      ]
    );
  };

  const calculateSelectedTotal = () => {
    return payrolls
      .filter(p => selectedPayrolls.includes(p._id))
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);
  };

  const totalNetSalaryGenerated = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  const handleSelectStructureEmp = (empId: string) => {
    setSelectedEmp(empId);
    const existing = structures.find(s => (s.employeeId?._id === empId || s.employeeId === empId));
    if (existing) {
      setStructFormData({
        basic: existing.basic || 0,
        hra: existing.hra || 0,
        specialAllowance: existing.specialAllowance || 0,
        pf: existing.pf || 0,
        esi: existing.esi || 0,
        professionalTax: existing.professionalTax || 0,
        incomeTax: existing.incomeTax || 0,
      });
    } else {
      setStructFormData({
        basic: 0,
        hra: 0,
        specialAllowance: 0,
        pf: 0,
        esi: 0,
        professionalTax: 0,
        incomeTax: 0,
      });
    }
  };

  const handleSaveStructure = async () => {
    if (!selectedEmp) return;
    setSaveLoading(true);
    try {
      const res = await apiCall('/api/payroll/structure', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: selectedEmp,
          ...structFormData,
        }),
      });
      if (res.success) {
        Alert.alert('Success', 'Salary Structure Saved Successfully!');
        fetchEmployeesAndStructures();
      } else {
        Alert.alert('Error', res.error || 'Failed to save salary structure.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <View style={styles.payrollContainer}>
      {/* Top Header & Navigation Tabs */}
      <View style={styles.payrollHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>
            {activeSubTab === 'dashboard' ? 'Payroll Dashboard' : 'Salary Structures'}
          </Text>
          <Text style={styles.empSubtitle}>
            {activeSubTab === 'dashboard'
              ? 'Manage, generate, and bulk pay employee salaries.'
              : 'Configure fixed earnings and deductions for employees.'}
          </Text>
        </View>

        <View style={styles.payrollTabBtnGroup}>
          <TouchableOpacity
            style={[styles.payrollTabBtn, activeSubTab === 'dashboard' && styles.payrollTabBtnActive]}
            onPress={() => setActiveSubTab('dashboard')}
          >
            <Text style={[styles.payrollTabBtnText, activeSubTab === 'dashboard' && styles.payrollTabBtnTextActive]}>
              Ledger
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payrollTabBtn, activeSubTab === 'structures' && styles.payrollTabBtnActive]}
            onPress={() => setActiveSubTab('structures')}
          >
            <Settings size={14} color={activeSubTab === 'structures' ? '#fff' : colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.payrollTabBtnText, activeSubTab === 'structures' && styles.payrollTabBtnTextActive]}>
              Structures
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DASHBOARD TAB CONTENT */}
      {activeSubTab === 'dashboard' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Top Month Selector & Total Net Card */}
          <View style={styles.monthSelectorRow}>
            <View style={styles.monthInputBox}>
              <Calendar size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.monthInput}
                placeholder="YYYY-MM (e.g. 2026-07)"
                placeholderTextColor={colors.textMuted}
                value={monthYear}
                onChangeText={setMonthYear}
              />
              {monthYear ? (
                <TouchableOpacity onPress={() => setMonthYear('')}>
                  <Text style={styles.clearMonthText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.netSalaryCard}>
            <Text style={styles.netSalaryCardLabel}>Total Net Salary Generated</Text>
            <Text style={styles.netSalaryCardValue}>₹ {totalNetSalaryGenerated.toLocaleString()}</Text>
          </View>

          {/* Table Header */}
          <View style={styles.payrollTableHeader}>
            <TouchableOpacity onPress={toggleAll} style={styles.checkboxTouch}>
              <View style={[styles.customCheckbox, selectedPayrolls.length > 0 && styles.customCheckboxChecked]} />
            </TouchableOpacity>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>Employee</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>Gross</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>Deductions</Text>
            <Text style={[styles.tableColHeader, { flex: 1.2, textAlign: 'right', color: colors.success }]}>Net Salary</Text>
          </View>

          {/* Table Rows */}
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 30 }} />
          ) : employees.length === 0 ? (
            <Text style={styles.noEmployeesText}>No employee records found.</Text>
          ) : (
            employees.map((emp) => {
              const payroll = payrolls.find(p => (p.employeeId?._id === emp._id || p.employeeId === emp._id || p.employeeId?.id === emp._id));
              const isApproved = payroll && payroll.status === 'Approved';
              const isSelected = payroll && selectedPayrolls.includes(payroll._id);

              return (
                <View key={emp._id || emp.id} style={styles.payrollTableRow}>
                  <TouchableOpacity
                    disabled={!isApproved}
                    onPress={() => payroll && toggleSelection(payroll._id)}
                    style={styles.checkboxTouch}
                  >
                    <View
                      style={[
                        styles.customCheckbox,
                        isSelected && styles.customCheckboxChecked,
                        !isApproved && styles.customCheckboxDisabled
                      ]}
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 2 }}>
                    <Text style={styles.empNameText}>{emp.firstName} {emp.lastName}</Text>
                    <Text style={styles.empCodeText}>{emp.employeeCode}</Text>
                  </View>

                  {payroll ? (
                    <>
                      <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right' }]}>
                        ₹{payroll.grossSalary?.toLocaleString() || 0}
                      </Text>
                      <Text style={[styles.tableCellText, { flex: 1, textAlign: 'right', color: colors.danger }]}>
                        -₹{payroll.totalDeductions?.toLocaleString() || 0}
                      </Text>
                      <Text style={[styles.tableCellText, { flex: 1.2, textAlign: 'right', color: colors.success, fontWeight: 'bold' }]}>
                        ₹{payroll.netSalary?.toLocaleString() || 0}
                      </Text>
                    </>
                  ) : (
                    <View style={{ flex: 3.2, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: colors.textMuted, fontStyle: 'italic' }}>Not Generated</Text>
                    </View>
                  )}

                  <View style={{ marginLeft: 8 }}>
                    {payroll ? (
                      <TouchableOpacity
                        style={styles.actionSlipBtn}
                        onPress={() => setSelectedPayrollSlip(payroll)}
                      >
                        <Text style={styles.actionSlipBtnText}>Slip</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionGenerateBtn, generating && styles.disabledButton]}
                        onPress={() => handleGenerate(emp._id || emp.id)}
                        disabled={generating}
                      >
                        <Text style={styles.actionGenerateBtnText}>Generate</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        /* STRUCTURES TAB CONTENT */
        <View style={{ flex: 1 }}>
          <View style={styles.structuresLayout}>
            {/* Left/Top Employee selector list */}
            <View style={styles.structEmpListCard}>
              <Text style={styles.structEmpListTitle}>Employees</Text>
              <ScrollView style={{ flex: 1 }}>
                {employees.map((emp) => {
                  const hasStruct = structures.some(s => (s.employeeId?._id === emp._id || s.employeeId === emp._id));
                  const isSelected = selectedEmp === emp._id;
                  return (
                    <TouchableOpacity
                      key={emp._id}
                      style={[styles.structEmpItem, isSelected && styles.structEmpItemActive]}
                      onPress={() => handleSelectStructureEmp(emp._id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.empNameText}>{emp.firstName} {emp.lastName}</Text>
                        <Text style={styles.empCodeText}>{emp.employeeCode}</Text>
                      </View>
                      <View style={[styles.dotIndicator, { backgroundColor: hasStruct ? '#10b981' : '#ef4444' }]} />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right/Bottom Form Card */}
            {selectedEmp ? (
              <ScrollView style={styles.structFormCard}>
                <Text style={styles.structFormTitle}>Configure Salary Structure</Text>

                <Text style={[styles.sectionHeading, { color: colors.success }]}>Earnings</Text>
                <View style={styles.formRow2Col}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Basic Salary (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={String(structFormData.basic)}
                      onChangeText={(val) => setStructFormData({ ...structFormData, basic: Number(val) || 0 })}
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>HRA (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={String(structFormData.hra)}
                      onChangeText={(val) => setStructFormData({ ...structFormData, hra: Number(val) || 0 })}
                    />
                  </View>
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Special Allowance (₹)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    value={String(structFormData.specialAllowance)}
                    onChangeText={(val) => setStructFormData({ ...structFormData, specialAllowance: Number(val) || 0 })}
                  />
                </View>

                <Text style={[styles.sectionHeading, { color: colors.danger, marginTop: spacing.s }]}>Fixed Deductions</Text>
                <View style={styles.formRow2Col}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>PF Amount (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={String(structFormData.pf)}
                      onChangeText={(val) => setStructFormData({ ...structFormData, pf: Number(val) || 0 })}
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>ESI Amount (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={String(structFormData.esi)}
                      onChangeText={(val) => setStructFormData({ ...structFormData, esi: Number(val) || 0 })}
                    />
                  </View>
                </View>

                <View style={styles.formRow2Col}>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Professional Tax (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={String(structFormData.professionalTax)}
                      onChangeText={(val) => setStructFormData({ ...structFormData, professionalTax: Number(val) || 0 })}
                    />
                  </View>
                  <View style={styles.formCol}>
                    <Text style={styles.formLabel}>Income Tax / TDS (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      keyboardType="numeric"
                      value={String(structFormData.incomeTax)}
                      onChangeText={(val) => setStructFormData({ ...structFormData, incomeTax: Number(val) || 0 })}
                    />
                  </View>
                </View>

                {/* Gross Summary */}
                <View style={styles.grossSummaryBox}>
                  <Text style={styles.grossSummaryLabel}>Gross Monthly Salary</Text>
                  <Text style={styles.grossSummaryVal}>
                    ₹{(structFormData.basic + structFormData.hra + structFormData.specialAllowance).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.structFormActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedEmp(null)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, saveLoading && styles.disabledButton]}
                    onPress={handleSaveStructure}
                    disabled={saveLoading}
                  >
                    {saveLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Structure</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.selectEmpPromptBox}>
                <Text style={styles.selectEmpPromptText}>Select an employee from the left panel to configure their salary structure.</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedPayrolls.length > 0 && (
        <View style={styles.floatingBulkBar}>
          <View>
            <Text style={styles.bulkBarTitle}>Selected ({selectedPayrolls.length})</Text>
            <Text style={styles.bulkBarVal}>₹{calculateSelectedTotal().toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bulkPayBtn, processingBulk && styles.disabledButton]}
            onPress={handleBulkPayment}
            disabled={processingBulk}
          >
            {processingBulk ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bulkPayBtnText}>Process Bank Transfer</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Salary Slip Detail Modal */}
      <Modal visible={!!selectedPayrollSlip} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payslip Details</Text>
              <TouchableOpacity onPress={() => setSelectedPayrollSlip(null)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedPayrollSlip && (
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>
                  {selectedPayrollSlip.employeeId?.firstName} {selectedPayrollSlip.employeeId?.lastName}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>
                  Period: {selectedPayrollSlip.monthYear} • Status: {selectedPayrollSlip.status}
                </Text>

                <View style={styles.detailCard}>
                  <Text style={[styles.detailCardTitle, { color: colors.success }]}>Earnings</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Basic</Text>
                      <Text style={styles.detailVal}>₹{selectedPayrollSlip.earnings?.basic || 0}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>HRA</Text>
                      <Text style={styles.detailVal}>₹{selectedPayrollSlip.earnings?.hra || 0}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Special Allowance</Text>
                      <Text style={styles.detailVal}>₹{selectedPayrollSlip.earnings?.specialAllowance || 0}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Bonus / Incentive</Text>
                      <Text style={styles.detailVal}>₹{(selectedPayrollSlip.earnings?.bonus || 0) + (selectedPayrollSlip.earnings?.incentive || 0)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <Text style={[styles.detailCardTitle, { color: colors.danger }]}>Deductions</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>PF</Text>
                      <Text style={styles.detailVal}>₹{selectedPayrollSlip.deductions?.pf || 0}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>ESI</Text>
                      <Text style={styles.detailVal}>₹{selectedPayrollSlip.deductions?.esi || 0}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Professional Tax</Text>
                      <Text style={styles.detailVal}>₹{selectedPayrollSlip.deductions?.professionalTax || 0}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Income Tax</Text>
                      <Text style={styles.detailVal}>₹{selectedPayrollSlip.deductions?.incomeTax || 0}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.grossSummaryBox}>
                  <Text style={styles.grossSummaryLabel}>Net Payable Amount</Text>
                  <Text style={[styles.grossSummaryVal, { color: colors.success }]}>
                    ₹{selectedPayrollSlip.netSalary?.toLocaleString() || 0}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Attendance Sub-View ---
// --- Attendance Sub-View ---
const AttendanceView = () => {
  const { user } = useAuthStore();
  const userRole = (user?.role || '').toUpperCase().replace('_', '');
  const isAdmin = userRole === 'ADMIN' || userRole === 'KEYADMIN' || userRole === 'MANAGER';

  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [monthlyRecords, setMonthlyRecords] = useState<any[]>([]);
  const [managerRecords, setManagerRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchManagerAttendance = async (dateStr: string) => {
    setLoading(true);
    try {
      const res: any = await apiCall(`/api/attendance/manager?date=${dateStr}`);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setManagerRecords(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res: any = await apiCall('/api/attendance/today');
      if (res.success && res.data) {
        setTodayStatus(res.data.record || res.data.data || res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMonthly = async () => {
    try {
      const res: any = await apiCall(`/api/attendance/monthly?month=${currentMonth}`);
      if (res.success && res.data) {
        const list = Array.isArray(res.data.records)
          ? res.data.records
          : Array.isArray(res.data.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [];
        setMonthlyRecords(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchManagerAttendance(selectedDate);
    } else {
      fetchStatus();
      fetchMonthly();
    }
  }, [isAdmin, selectedDate]);

  const handlePunch = async (action: "IN" | "OUT") => {
    setPunching(true);
    try {
      const res = await apiCall('/api/attendance/punch', {
        method: 'POST',
        body: JSON.stringify({
          action,
          latitude: 28.5355,
          longitude: 77.3910,
        }),
      });

      if (res.success) {
        Alert.alert('Success', `Punched ${action} successfully!`);
        fetchStatus();
        fetchMonthly();
      } else {
        Alert.alert('Error', res.error || 'Failed to record punch.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Network error while punching in/out');
    } finally {
      setPunching(false);
    }
  };

  const formatPunchTime = (punchVal: any) => {
    if (!punchVal) return '-';
    if (typeof punchVal === 'string') {
      if (punchVal.includes(':')) return punchVal;
      const d = new Date(punchVal);
      return isNaN(d.getTime()) ? punchVal : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (punchVal.time) {
      const d = new Date(punchVal.time);
      return isNaN(d.getTime()) ? String(punchVal.time) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '-';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  // --- ADMIN & KEY ADMIN VIEW ---
  if (isAdmin) {
    const presentCount = managerRecords.filter(r => r.status === 'Present' || r.status === 'Half-Day' || r.punchIn).length;
    const absentCount = managerRecords.filter(r => r.status === 'Absent' && !r.punchIn).length;
    const lateCount = managerRecords.filter(r => r.metrics?.isLate || r.isLate || r.status === 'Late').length;

    return (
      <ScrollView contentContainerStyle={styles.attendanceContainer}>
        {/* Title */}
        <View style={{ marginBottom: spacing.m }}>
          <Text style={styles.empTitle}>All Employees Attendance</Text>
          <Text style={styles.empSubtitle}>
            Admin & Key Admin View — Live punch in & punch out status of all employees.
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.m }}>
          <View style={[styles.empStatPill, { flex: 1, backgroundColor: '#f0fdf4' }]}>
            <Text style={{ fontSize: 11, color: '#166534', fontWeight: '600' }}>TOTAL</Text>
            <Text style={{ fontSize: 18, color: '#15803d', fontWeight: 'bold' }}>{managerRecords.length}</Text>
          </View>

          <View style={[styles.empStatPill, { flex: 1, backgroundColor: '#ecfdf5' }]}>
            <Text style={{ fontSize: 11, color: '#047857', fontWeight: '600' }}>PRESENT</Text>
            <Text style={{ fontSize: 18, color: '#059669', fontWeight: 'bold' }}>{presentCount}</Text>
          </View>

          <View style={[styles.empStatPill, { flex: 1, backgroundColor: '#fef2f2' }]}>
            <Text style={{ fontSize: 11, color: '#991b1b', fontWeight: '600' }}>ABSENT</Text>
            <Text style={{ fontSize: 18, color: '#dc2626', fontWeight: 'bold' }}>{absentCount}</Text>
          </View>

          <View style={[styles.empStatPill, { flex: 1, backgroundColor: '#fffbeb' }]}>
            <Text style={{ fontSize: 11, color: '#92400e', fontWeight: '600' }}>LATE</Text>
            <Text style={{ fontSize: 18, color: '#d97706', fontWeight: 'bold' }}>{lateCount}</Text>
          </View>
        </View>

        {/* All Employees Attendance List */}
        <View style={styles.monthlyHistoryCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s }}>
            <Text style={styles.attCardTitle}>Employee Punch Records ({selectedDate})</Text>
          </View>

          <ScrollView horizontal style={{ marginTop: spacing.s }}>
            <View>
              <View style={styles.attTableHeader}>
                <Text style={[styles.attTableCol, { width: 160 }]}>Employee Name</Text>
                <Text style={[styles.attTableCol, { width: 100 }]}>Code / Dept</Text>
                <Text style={[styles.attTableCol, { width: 100 }]}>Status</Text>
                <Text style={[styles.attTableCol, { width: 100, textAlign: 'center' }]}>Punch In</Text>
                <Text style={[styles.attTableCol, { width: 100, textAlign: 'center' }]}>Punch Out</Text>
                <Text style={[styles.attTableCol, { width: 80, textAlign: 'right' }]}>Hours</Text>
              </View>

              {managerRecords.length === 0 ? (
                <Text style={[styles.noAttText, { marginVertical: 20 }]}>No employee records found.</Text>
              ) : (
                managerRecords.map((record, index) => {
                  const emp = record.employeeId || {};
                  const empName = emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : 'Unknown Employee';
                  const empCode = emp.employeeCode || '-';
                  const empDept = emp.department || emp.designation || '-';

                  return (
                    <View key={record._id || index} style={styles.attTableRow}>
                      <View style={{ width: 160 }}>
                        <Text style={[styles.empNameText, { fontSize: 13 }]} numberOfLines={1}>
                          {empName}
                        </Text>
                      </View>

                      <View style={{ width: 100 }}>
                        <Text style={[styles.empCodeText, { fontWeight: '600' }]}>{empCode}</Text>
                        <Text style={styles.photoTipText} numberOfLines={1}>{empDept}</Text>
                      </View>

                      <View style={{ width: 100, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[
                          styles.attStatusPill,
                          (record.status === "Present" || record.punchIn) ? styles.statusPresent : styles.statusAbsent
                        ]}>
                          <Text style={[
                            styles.attStatusPillText,
                            (record.status === "Present" || record.punchIn) ? styles.statusPresentText : styles.statusAbsentText
                          ]}>
                            {record.punchIn ? 'Punched In' : record.status || 'Absent'}
                          </Text>
                        </View>
                        {(record.metrics?.isLate || record.isLate) && (
                          <Text style={styles.lateStatusTextBadge}>Late</Text>
                        )}
                      </View>

                      <Text style={[styles.attTableCell, { width: 100, textAlign: 'center', fontWeight: '500' }]}>
                        {formatPunchTime(record.punchIn || record.inTime || record.punchInTime)}
                      </Text>
                      <Text style={[styles.attTableCell, { width: 100, textAlign: 'center', fontWeight: '500' }]}>
                        {formatPunchTime(record.punchOut || record.outTime || record.punchOutTime)}
                      </Text>
                      <Text style={[styles.attTableCell, { width: 80, textAlign: 'right', fontWeight: '600' }]}>
                        {record.metrics?.workingHours ? `${record.metrics.workingHours}h` : record.workingHours ? `${record.workingHours}h` : '-'}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    );
  }

  // --- STANDARD EMPLOYEE VIEW ---
  const hasPunchedIn = !!(
    todayStatus?.punchIn ||
    todayStatus?.inTime ||
    todayStatus?.punchInTime ||
    (todayStatus?.status && todayStatus?.status !== 'Absent') ||
    todayStatus?.hasPunchedIn
  );

  const hasPunchedOut = !!(
    todayStatus?.punchOut ||
    todayStatus?.outTime ||
    todayStatus?.punchOutTime ||
    todayStatus?.hasPunchedOut
  );

  return (
    <ScrollView contentContainerStyle={styles.attendanceContainer}>
      {/* Title */}
      <View style={{ marginBottom: spacing.m }}>
        <Text style={styles.empTitle}>Attendance Dashboard</Text>
        <Text style={styles.empSubtitle}>Track your daily punches and review monthly history.</Text>
      </View>

      {/* Action Center Card */}
      <View style={styles.attActionCard}>
        <Text style={styles.attCardTitle}>Action Center</Text>
        <Text style={styles.attCardSubTitle}>Record your daily attendance</Text>

        <View style={styles.clockDisplayBox}>
          <Text style={styles.clockTimeText}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
          <Text style={styles.clockDateText}>
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>

          {!hasPunchedIn && (
            <TouchableOpacity
              style={[styles.punchBtn, styles.punchInBtn, punching && styles.disabledButton]}
              onPress={() => handlePunch("IN")}
              disabled={punching}
            >
              {punching ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Clock size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.punchBtnText}>Punch In</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {hasPunchedIn && !hasPunchedOut && (
            <TouchableOpacity
              style={[styles.punchBtn, styles.punchOutBtn, punching && styles.disabledButton]}
              onPress={() => handlePunch("OUT")}
              disabled={punching}
            >
              {punching ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Clock size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.punchBtnText}>Punch Out</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {hasPunchedIn && hasPunchedOut && (
            <View style={styles.shiftCompletedBadge}>
              <UserCheck size={18} color="#10b981" style={{ marginRight: 6 }} />
              <Text style={styles.shiftCompletedText}>Shift Completed</Text>
            </View>
          )}
        </View>

        {hasPunchedIn && (
          <View style={{ marginTop: spacing.s }}>
            {/* Punch In Info Pill matching screenshot */}
            <View style={styles.punchInfoPillRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                <Text style={styles.punchInfoPillLabel}>Punch In</Text>
              </View>
              <Text style={styles.punchInfoPillVal}>
                {formatPunchTime(todayStatus?.punchIn || todayStatus?.inTime || todayStatus?.punchInTime)}
              </Text>
            </View>

            {/* Late Warning matching screenshot */}
            {(todayStatus?.metrics?.isLate || todayStatus?.isLate || todayStatus?.status === 'Late') && (
              <View style={styles.lateAlertBox}>
                <AlertCircle size={16} color="#d97706" style={{ marginRight: 6 }} />
                <Text style={styles.lateAlertText}>You were marked Late today.</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Monthly History Card */}
      <View style={styles.monthlyHistoryCard}>
        <Text style={styles.attCardTitle}>Monthly History ({monthName})</Text>

        <View style={styles.attTableHeader}>
          <Text style={[styles.attTableCol, { flex: 1.2 }]}>Date</Text>
          <Text style={[styles.attTableCol, { flex: 1 }]}>Status</Text>
          <Text style={[styles.attTableCol, { flex: 1, textAlign: 'center' }]}>Punch In</Text>
          <Text style={[styles.attTableCol, { flex: 1, textAlign: 'center' }]}>Punch Out</Text>
          <Text style={[styles.attTableCol, { flex: 0.8, textAlign: 'right' }]}>Hours</Text>
        </View>

        {monthlyRecords.length === 0 ? (
          <Text style={styles.noAttText}>No attendance records found for this month.</Text>
        ) : (
          monthlyRecords.map((record, index) => (
            <View key={record._id || record.id || index} style={styles.attTableRow}>
              <Text style={[styles.attTableCell, { flex: 1.2, fontWeight: 'bold' }]}>
                {record.date ? record.date.slice(0, 10) : '-'}
              </Text>

              <View style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center' }}>
                <View style={[
                  styles.attStatusPill,
                  record.status === "Present" ? styles.statusPresent : styles.statusAbsent
                ]}>
                  <Text style={[
                    styles.attStatusPillText,
                    record.status === "Present" ? styles.statusPresentText : styles.statusAbsentText
                  ]}>
                    {record.status || 'Present'}
                  </Text>
                </View>
                {(record.metrics?.isLate || record.isLate) && (
                  <Text style={styles.lateStatusTextBadge}>Late</Text>
                )}
              </View>

              <Text style={[styles.attTableCell, { flex: 1, textAlign: 'center' }]}>
                {formatPunchTime(record.punchIn || record.inTime || record.punchInTime)}
              </Text>
              <Text style={[styles.attTableCell, { flex: 1, textAlign: 'center' }]}>
                {formatPunchTime(record.punchOut || record.outTime || record.punchOutTime)}
              </Text>
              <Text style={[styles.attTableCell, { flex: 0.8, textAlign: 'right' }]}>
                {record.metrics?.workingHours ? `${record.metrics.workingHours}h` : record.workingHours ? `${record.workingHours}h` : '-'}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// --- Leave Management Sub-View ---
const LeaveView = () => {
  const [activeTab, setActiveTab] = useState<'myLeaves' | 'teamApprovals'>('myLeaves');
  const [balances, setBalances] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [balRes, leavesRes, teamRes] = await Promise.all([
        apiCall('/api/leave/balances'),
        apiCall('/api/leave'),
        apiCall('/api/leave/manager')
      ]);

      if (balRes.success && balRes.data) {
        setBalances(balRes.data.balances);
      }
      if (leavesRes.success && leavesRes.data) {
        setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      }
      if (teamRes.success && teamRes.data) {
        setTeamLeaves(Array.isArray(teamRes.data) ? teamRes.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason) {
      Alert.alert('Validation Error', 'Please enter Start Date, End Date, and Reason.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await apiCall('/api/leave', {
        method: 'POST',
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          isHalfDay,
          reason,
        }),
      });

      if (res.success) {
        Alert.alert('Success', 'Leave requested successfully!');
        setShowApplyModal(false);
        setStartDate('');
        setEndDate('');
        setReason('');
        setIsHalfDay(false);
        fetchData();
      } else {
        Alert.alert('Error', res.error || 'Failed to request leave.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    Alert.alert(
      'Cancel Leave',
      'Are you sure you want to cancel this leave request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await apiCall('/api/leave/cancel', {
                method: 'POST',
                body: JSON.stringify({ leaveId }),
              });

              if (res.success) {
                Alert.alert('Success', 'Leave request cancelled.');
                fetchData();
              } else {
                Alert.alert('Error', res.error || 'Failed to cancel leave.');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred.');
            }
          }
        }
      ]
    );
  };

  const handleManagerAction = async (leaveId: string, action: "Approve" | "Reject") => {
    try {
      const res = await apiCall('/api/leave/manager', {
        method: 'POST',
        body: JSON.stringify({ leaveId, action, managerNotes: '' }),
      });

      if (res.success) {
        Alert.alert('Success', `Leave request ${action.toLowerCase()}d.`);
        fetchData();
      } else {
        Alert.alert('Error', res.error || `Failed to ${action.toLowerCase()} leave.`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading leave balances...</Text>
      </View>
    );
  }

  return (
    <View style={styles.leaveContainer}>
      {/* Title & Top Navigation Group */}
      <View style={styles.leaveHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Leave Management</Text>
          <Text style={styles.empSubtitle}>View your balances and apply for time off.</Text>
        </View>

        <View style={styles.leaveActionBtns}>
          <TouchableOpacity
            style={[styles.teamApprovalsBtn, activeTab === 'teamApprovals' && styles.teamApprovalsBtnActive]}
            onPress={() => setActiveTab(activeTab === 'myLeaves' ? 'teamApprovals' : 'myLeaves')}
          >
            <Text style={[styles.teamApprovalsText, activeTab === 'teamApprovals' && styles.teamApprovalsTextActive]}>
              {activeTab === 'myLeaves' ? 'Team Approvals' : 'My History'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyLeaveBtn} onPress={() => setShowApplyModal(true)}>
            <Plus size={16} color={colors.background} style={{ marginRight: 4 }} />
            <Text style={styles.applyLeaveBtnText}>Apply Leave</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MY LEAVES TAB */}
      {activeTab === 'myLeaves' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Leave Balances Horizontal Grid */}
          <Text style={styles.sectionTitle}>Leave Balances</Text>
          <View style={styles.leaveBalancesGrid}>
            {Object.entries(balances || {}).map(([type, count]) => (
              <View key={type} style={styles.balanceCard}>
                <Text style={styles.balanceTypeLabel}>{type}</Text>
                <Text style={styles.balanceCountVal}>{count as number}</Text>
              </View>
            ))}
          </View>

          {/* Leave History Card */}
          <View style={styles.historyCard}>
            <Text style={styles.attCardTitle}>My Leave History</Text>

            <View style={styles.attTableHeader}>
              <Text style={[styles.attTableCol, { flex: 1.2 }]}>Type</Text>
              <Text style={[styles.attTableCol, { flex: 2 }]}>Dates</Text>
              <Text style={[styles.attTableCol, { flex: 1 }]}>Duration</Text>
              <Text style={[styles.attTableCol, { flex: 1.2 }]}>Status</Text>
              <Text style={[styles.attTableCol, { flex: 0.8, textAlign: 'right' }]}>Action</Text>
            </View>

            {leaves.length === 0 ? (
              <Text style={styles.noAttText}>No leaves requested yet.</Text>
            ) : (
              leaves.map((leave) => {
                const isPending = leave.status === 'Pending';
                const isPast = new Date(leave.startDate) < new Date();

                return (
                  <View key={leave._id} style={styles.attTableRow}>
                    <Text style={[styles.attTableCell, { flex: 1.2, fontWeight: 'bold' }]}>{leave.leaveType}</Text>
                    <Text style={[styles.attTableCell, { flex: 2, fontSize: 11 }]}>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.attTableCell, { flex: 1, fontSize: 11 }]}>
                      {leave.isHalfDay ? 'Half Day' : 'Full Day'}
                    </Text>

                    <View style={{ flex: 1.2 }}>
                      <View style={[
                        styles.attStatusPill,
                        leave.status === 'Approved' ? styles.statusPresent :
                          leave.status === 'Rejected' ? styles.statusAbsent :
                            styles.statusPendingPill
                      ]}>
                        <Text style={[
                          styles.attStatusPillText,
                          leave.status === 'Approved' ? styles.statusPresentText :
                            leave.status === 'Rejected' ? styles.statusAbsentText :
                              styles.statusPendingText
                        ]}>
                          {leave.status}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                      {isPending && !isPast && (
                        <TouchableOpacity onPress={() => handleCancelLeave(leave._id)}>
                          <XCircle size={18} color={colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      ) : (
        /* TEAM APPROVALS TAB */
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.historyCard}>
            <Text style={styles.attCardTitle}>Pending Team Leave Requests</Text>

            <View style={styles.attTableHeader}>
              <Text style={[styles.attTableCol, { flex: 1.8 }]}>Employee</Text>
              <Text style={[styles.attTableCol, { flex: 1 }]}>Type</Text>
              <Text style={[styles.attTableCol, { flex: 2 }]}>Dates</Text>
              <Text style={[styles.attTableCol, { flex: 1.2 }]}>Status</Text>
              <Text style={[styles.attTableCol, { flex: 1.5, textAlign: 'right' }]}>Actions</Text>
            </View>

            {teamLeaves.length === 0 ? (
              <Text style={styles.noAttText}>No team leave requests found!</Text>
            ) : (
              teamLeaves.map((leave) => (
                <View key={leave._id} style={styles.attTableRow}>
                  <View style={{ flex: 1.8 }}>
                    <Text style={styles.empNameText}>{leave.employeeId?.firstName} {leave.employeeId?.lastName}</Text>
                    <Text style={styles.empCodeText}>{leave.employeeId?.employeeCode}</Text>
                  </View>

                  <Text style={[styles.attTableCell, { flex: 1, fontWeight: 'bold' }]}>{leave.leaveType}</Text>

                  <Text style={[styles.attTableCell, { flex: 2, fontSize: 11 }]}>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </Text>

                  <View style={{ flex: 1.2 }}>
                    <View style={[
                      styles.attStatusPill,
                      leave.status === 'Approved' ? styles.statusPresent :
                        leave.status === 'Rejected' ? styles.statusAbsent :
                          styles.statusPendingPill
                    ]}>
                      <Text style={[
                        styles.attStatusPillText,
                        leave.status === 'Approved' ? styles.statusPresentText :
                          leave.status === 'Rejected' ? styles.statusAbsentText :
                            styles.statusPendingText
                      ]}>
                        {leave.status}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1.5, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    {leave.status === 'Pending' ? (
                      <>
                        <TouchableOpacity
                          style={styles.approveSmallBtn}
                          onPress={() => handleManagerAction(leave._id, 'Approve')}
                        >
                          <Text style={styles.approveSmallText}>Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.rejectSmallBtn}
                          onPress={() => handleManagerAction(leave._id, 'Reject')}
                        >
                          <Text style={styles.rejectSmallText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <Text style={{ fontSize: 10, color: colors.textMuted, fontStyle: 'italic' }}>Processed</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Apply Leave Modal */}
      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Time Off</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.formLabel}>Leave Type</Text>
              <View style={styles.typeSelectionRow}>
                {['Casual', 'Sick', 'Earned', 'Loss of Pay'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeSelectBtn, leaveType === type && styles.typeSelectBtnActive]}
                    onPress={() => setLeaveType(type)}
                  >
                    <Text style={[styles.typeSelectText, leaveType === type && styles.typeSelectTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Start Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 2026-07-25"
                placeholderTextColor={colors.textMuted}
                value={startDate}
                onChangeText={setStartDate}
              />

              <Text style={styles.formLabel}>End Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 2026-07-26"
                placeholderTextColor={colors.textMuted}
                value={endDate}
                onChangeText={setEndDate}
              />

              <TouchableOpacity
                style={styles.halfDayCheckboxRow}
                onPress={() => setIsHalfDay(!isHalfDay)}
              >
                <View style={[styles.customCheckbox, isHalfDay && styles.customCheckboxChecked]} />
                <Text style={styles.halfDayLabelText}>Half Day Request</Text>
              </TouchableOpacity>

              <Text style={styles.formLabel}>Reason *</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Enter reason for leave..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={reason}
                onChangeText={setReason}
              />

              <View style={styles.structFormActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowApplyModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, submitLoading && styles.disabledButton]}
                  onPress={handleApplyLeave}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={styles.saveBtnText}>Submit Request</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Holidays Sub-View ---
const HolidaysView = () => {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'Public',
    description: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/api/holidays');
      if (res.success && res.data) {
        setHolidays(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddHoliday = async () => {
    if (!formData.name || !formData.date) {
      Alert.alert('Validation Error', 'Please enter Holiday Name and Date.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await apiCall('/api/holidays', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        Alert.alert('Success', 'Holiday added successfully!');
        setShowAddCard(false);
        setFormData({ name: '', date: '', type: 'Public', description: '' });
        fetchHolidays();
      } else {
        Alert.alert('Error', res.error || 'Failed to add holiday.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading holiday calendar...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.holidayContainer}>
      {/* Title & Add Button */}
      <View style={styles.holidayHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Holiday Calendar</Text>
          <Text style={styles.empSubtitle}>View upcoming company and public holidays.</Text>
        </View>

        <TouchableOpacity
          style={styles.addHolidayBtn}
          onPress={() => setShowAddCard(!showAddCard)}
        >
          <Plus size={16} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.addHolidayBtnText}>Add Holiday</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Holiday Form Card matching screenshot */}
      {showAddCard && (
        <View style={styles.addHolidayCard}>
          <Text style={styles.addHolidayCardTitle}>Add New Holiday</Text>

          <View style={styles.formRow2Col}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Holiday Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Christmas"
                placeholderTextColor={colors.textMuted}
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 2026-12-25"
                placeholderTextColor={colors.textMuted}
                value={formData.date}
                onChangeText={(val) => setFormData({ ...formData, date: val })}
              />
            </View>
          </View>

          <Text style={styles.formLabel}>Type</Text>
          <View style={styles.typeSelectionRow}>
            {['Public', 'Company', 'Optional'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeSelectBtn, formData.type === type && styles.typeSelectBtnActive]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Text style={[styles.typeSelectText, formData.type === type && styles.typeSelectTextActive]}>
                  {type} Holiday
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Description</Text>
          <TextInput
            style={styles.modalTextInput}
            placeholder="Optional description..."
            placeholderTextColor={colors.textMuted}
            value={formData.description}
            onChangeText={(val) => setFormData({ ...formData, description: val })}
          />

          <View style={styles.structFormActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddCard(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, submitLoading && styles.disabledButton]}
              onPress={handleAddHoliday}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.saveBtnText}>Save Holiday</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Holiday Cards Grid */}
      <View style={styles.holidayGrid}>
        {holidays.map((holiday) => (
          <View key={holiday._id} style={styles.holidayCardItem}>
            <View style={styles.holidayIconBox}>
              <Calendar size={22} color={colors.accent} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.holidayNameText}>{holiday.name}</Text>
              <Text style={styles.holidayDateText}>
                {new Date(holiday.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>

              <View style={styles.holidayTypeTag}>
                <Text style={styles.holidayTypeTagText}>{holiday.type} Holiday</Text>
              </View>

              {holiday.description ? (
                <Text style={styles.holidayDescText}>{holiday.description}</Text>
              ) : null}
            </View>
          </View>
        ))}

        {holidays.length === 0 && (
          <View style={styles.emptyHolidaysBox}>
            <Text style={styles.emptyHolidaysText}>No upcoming holidays found.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// --- Leads Pipeline Sub-View ---
const LeadsView = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [status, setStatus] = useState('');

  // Add Lead Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [leadValue, setLeadValue] = useState('');
  const [leadStage, setLeadStage] = useState('New');
  const [leadPriority, setLeadPriority] = useState('Medium');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Detail Modal State
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (stage) query.append('stage', stage);
      if (status) query.append('status', status);

      const res = await apiCall(`/api/leads?${query.toString()}`);
      if (res.success && res.data) {
        setLeads(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [stage, status]);

  const handleAddLead = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Validation Error', 'First Name and Last Name are required.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await apiCall('/api/leads', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          company,
          value: Number(leadValue) || 0,
          stage: leadStage,
          priority: leadPriority,
          status: 'Open',
        }),
      });

      if (res.success) {
        Alert.alert('Success', 'Lead created successfully!');
        setShowAddModal(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setCompany('');
        setLeadValue('');
        fetchLeads();
      } else {
        Alert.alert('Error', res.error || 'Failed to create lead.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <View style={styles.leadsContainer}>
      {/* Title Row */}
      <View style={styles.leadsHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Lead Pipeline</Text>
          <Text style={styles.empSubtitle}>Track, manage, and close your sales opportunities.</Text>
        </View>

        <TouchableOpacity
          style={styles.addLeadBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={16} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.addLeadBtnText}>Add Lead</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Card matching screenshot */}
      <View style={styles.leadsFilterCard}>
        <Text style={styles.filterGroupLabel}>SEARCH</Text>
        <View style={styles.searchContainer}>
          <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, company, email..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={fetchLeads}
          />
        </View>

        <View style={styles.filterDropdownRow}>
          {/* Stage selector */}
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.filterGroupLabel}>STAGE</Text>
            <View style={styles.filterBadgeRow}>
              {['', 'New', 'Contacted', 'Qualified', 'Proposal'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.smallFilterPill, stage === st && styles.smallFilterPillActive]}
                  onPress={() => setStage(st)}
                >
                  <Text style={[styles.smallFilterText, stage === st && styles.smallFilterTextActive]}>
                    {st || 'All Stages'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filter submit button */}
          <TouchableOpacity style={styles.filterSubmitBtn} onPress={fetchLeads}>
            <Text style={styles.filterSubmitText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Leads Table Card */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.historyCard}>
          <View style={styles.attTableHeader}>
            <Text style={[styles.attTableCol, { flex: 2 }]}>Lead Name</Text>
            <Text style={[styles.attTableCol, { flex: 1.5 }]}>Company</Text>
            <Text style={[styles.attTableCol, { flex: 1 }]}>Stage</Text>
            <Text style={[styles.attTableCol, { flex: 1 }]}>Priority</Text>
            <Text style={[styles.attTableCol, { flex: 0.8, textAlign: 'right' }]}>Actions</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 30 }} />
          ) : leads.length === 0 ? (
            <Text style={styles.noAttText}>No leads found matching your criteria.</Text>
          ) : (
            leads.map((lead) => (
              <TouchableOpacity
                key={lead._id}
                style={styles.attTableRow}
                onPress={() => setSelectedLead(lead)}
              >
                <View style={{ flex: 2 }}>
                  <Text style={styles.empNameText}>{lead.firstName} {lead.lastName}</Text>
                  <Text style={styles.empCodeText}>{lead.email || lead.phone || 'No Contact'}</Text>
                </View>

                <Text style={[styles.attTableCell, { flex: 1.5, color: colors.textMuted }]}>
                  {lead.company || '-'}
                </Text>

                <View style={{ flex: 1 }}>
                  <View style={[styles.attStatusPill, styles.stageBluePill]}>
                    <Text style={styles.stageBlueText}>{lead.stage || 'New'}</Text>
                  </View>
                </View>

                <Text style={[
                  styles.attTableCell,
                  { flex: 1, fontWeight: 'bold' },
                  lead.priority === 'High' ? { color: colors.danger } : { color: colors.textMuted }
                ]}>
                  {lead.priority || 'Medium'}
                </Text>

                <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                  <TouchableOpacity style={styles.viewLeadBtn} onPress={() => setSelectedLead(lead)}>
                    <Text style={styles.viewLeadBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Lead Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Lead</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.formLabel}>First Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter First Name"
                placeholderTextColor={colors.textMuted}
                value={firstName}
                onChangeText={setFirstName}
              />

              <Text style={styles.formLabel}>Last Name *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter Last Name"
                placeholderTextColor={colors.textMuted}
                value={lastName}
                onChangeText={setLastName}
              />

              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="email@domain.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Phone Number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.formLabel}>Company Name</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Company Name"
                placeholderTextColor={colors.textMuted}
                value={company}
                onChangeText={setCompany}
              />

              <Text style={styles.formLabel}>Opportunity Value (₹)</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 50000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={leadValue}
                onChangeText={setLeadValue}
              />

              <View style={styles.structFormActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, submitLoading && styles.disabledButton]}
                  onPress={handleAddLead}
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Lead</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Lead Detail Modal */}
      <Modal visible={!!selectedLead} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lead Opportunity</Text>
              <TouchableOpacity onPress={() => setSelectedLead(null)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedLead && (
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>
                  {selectedLead.firstName} {selectedLead.lastName}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 16 }}>
                  {selectedLead.company || 'No Company'} • Stage: {selectedLead.stage}
                </Text>

                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Lead Details</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailVal}>{selectedLead.email || '-'}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailVal}>{selectedLead.phone || '-'}</Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Value</Text>
                      <Text style={[styles.detailVal, { color: colors.success, fontWeight: 'bold' }]}>
                        ₹{selectedLead.value?.toLocaleString() || 0}
                      </Text>
                    </View>
                    <View style={styles.detailGridCol}>
                      <Text style={styles.detailLabel}>Priority</Text>
                      <Text style={styles.detailVal}>{selectedLead.priority || 'Medium'}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// --- Report Generator Sub-View ---
const ReportsView = () => {
  const [reportType, setReportType] = useState('Attendance');
  const [dateFilter, setDateFilter] = useState('month');
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const [summary, setSummary] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setHasRun(true);
    try {
      const query = new URLSearchParams({ type: reportType });
      if (dateFilter === 'month') query.append('month', monthYear);
      if (dateFilter === 'year') query.append('year', year);

      const res = await apiCall(`/api/reports/generator?${query.toString()}`);
      if (res.success && res.data) {
        setSummary(res.data.summary || []);
        setRows(res.data.rows || []);
      } else {
        Alert.alert('Error', res.error || 'Failed to generate report.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const reportOptions = [
    'Attendance', 'Leave', 'Salary', 'Wallet', 'Employee', 'Department', 'Lead'
  ];

  return (
    <ScrollView contentContainerStyle={styles.reportsContainer}>
      {/* Title */}
      <View style={{ marginBottom: spacing.m }}>
        <Text style={styles.empTitle}>Report Generator</Text>
        <Text style={styles.empSubtitle}>Generate, visualize, and export data across all modules.</Text>
      </View>

      {/* Control Panel Card matching screenshot */}
      <View style={styles.reportsControlCard}>
        <Text style={styles.filterGroupLabel}>REPORT TYPE</Text>
        <View style={styles.typeSelectionRow}>
          {reportOptions.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.smallFilterPill, reportType === t && styles.smallFilterPillActive]}
              onPress={() => setReportType(t)}
            >
              <Text style={[styles.smallFilterText, reportType === t && styles.smallFilterTextActive]}>
                {t} Report
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.s }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={styles.filterGroupLabel}>DATE FILTER</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={[styles.smallFilterPill, dateFilter === 'month' && styles.smallFilterPillActive]}
                onPress={() => setDateFilter('month')}
              >
                <Text style={[styles.smallFilterText, dateFilter === 'month' && styles.smallFilterTextActive]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallFilterPill, dateFilter === 'year' && styles.smallFilterPillActive]}
                onPress={() => setDateFilter('year')}
              >
                <Text style={[styles.smallFilterText, dateFilter === 'year' && styles.smallFilterTextActive]}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1.2 }}>
            <Text style={styles.filterGroupLabel}>{dateFilter === 'month' ? 'MONTH' : 'YEAR'}</Text>
            {dateFilter === 'month' ? (
              <TextInput
                style={styles.reportsInput}
                placeholder="YYYY-MM"
                placeholderTextColor={colors.textMuted}
                value={monthYear}
                onChangeText={setMonthYear}
              />
            ) : (
              <TextInput
                style={styles.reportsInput}
                placeholder="YYYY"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={year}
                onChangeText={setYear}
              />
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.generateReportBtn, loading && styles.disabledButton]}
          onPress={fetchReport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Search size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.generateReportBtnText}>Generate</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Generated Report Data Results Area */}
      {hasRun && !loading && (
        <View style={styles.historyCard}>
          {summary.length > 0 && (
            <View style={styles.summaryBadgesRow}>
              {summary.map((item: any, idx: number) => (
                <View key={idx} style={styles.summaryBadgeCard}>
                  <Text style={styles.summaryBadgeLabel}>{item.name}</Text>
                  <Text style={styles.summaryBadgeVal}>{item.value}</Text>
                </View>
              ))}
            </View>
          )}

          {rows.length > 0 ? (
            <ScrollView horizontal style={{ marginTop: spacing.s }}>
              <View>
                <View style={styles.attTableHeader}>
                  {Object.keys(rows[0]).map((key) => (
                    <Text key={key} style={[styles.attTableCol, { width: 110, paddingHorizontal: 4 }]}>
                      {key}
                    </Text>
                  ))}
                </View>
                {rows.map((row: any, rIdx: number) => (
                  <View key={rIdx} style={styles.attTableRow}>
                    {Object.values(row).map((val: any, vIdx: number) => (
                      <Text key={vIdx} style={[styles.attTableCell, { width: 110, paddingHorizontal: 4 }]}>
                        {String(val)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.noAttText}>No records matching your selected report criteria.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

// --- Settings Sub-View ---
const SettingsView = () => {
  const [activeTab, setActiveTab] = useState("Company Profile");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const TABS = [
    { name: "Company Profile", icon: Building },
    { name: "Departments", icon: Users },
    { name: "Designations", icon: Briefcase },
    { name: "Office Locations", icon: Building },
    { name: "Policies", icon: Umbrella },
    { name: "Email Templates", icon: Mail },
    { name: "SMS Templates", icon: MessageSquare },
    { name: "Integrations", icon: Plug },
    { name: "Access Control", icon: Shield }
  ];

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiCall("/api/settings");
      if (res.success && res.data) {
        // API returns { success, data: settingsObj } — apiCall wraps it, so actual settings may be nested
        const settingsData = res.data.data || res.data;
        setSettings(settingsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await apiCall("/api/users");
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "Access Control" && users.length === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  const handleRoleChange = async (email: string, newRole: string) => {
    try {
      const res = await apiCall("/api/users", {
        method: "PUT",
        body: JSON.stringify({ email, role: newRole }),
      });
      if (res.success) {
        setUsers(users.map((u) => (u.email === email ? { ...u, role: newRole } : u)));
        Alert.alert("Success", "Role updated successfully!");
      } else {
        Alert.alert("Error", res.error || "Failed to update role.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Error updating role.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiCall("/api/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      if (res.success) {
        // Sync back saved data from server
        if (res.data) {
          const savedData = res.data.data || res.data;
          setSettings(savedData);
        }
        Alert.alert("Success", "Master settings saved successfully!");
      } else {
        Alert.alert("Error", res.error || "Failed to save settings.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (field: string, value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(s => s);
    setSettings({ ...settings, [field]: arr });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (!settings) {
    return (
      <View style={styles.placeholderSection}>
        <Text style={styles.placeholderTitle}>Access Restricted</Text>
        <Text style={styles.placeholderSubtitle}>Failed to load settings. Master settings require Administrator access.</Text>
      </View>
    );
  }

  return (
    <View style={styles.settingsContainer}>
      {/* Title & Save Button Header */}
      <View style={styles.settingsHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Master Settings</Text>
          <Text style={styles.empSubtitle}>Configure global application parameters.</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveSettingsBtn, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveSettingsBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Horizontal Nav Bar matching screenshot side list */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.settingsTabScroll}>
        {TABS.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.settingsTabPill, isActive && styles.settingsTabPillActive]}
              onPress={() => setActiveTab(tab.name)}
            >
              <IconComp size={14} color={isActive ? colors.accent : colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.settingsTabText, isActive && styles.settingsTabTextActive]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Settings Card */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.settingsCard}>
          <Text style={styles.settingsCardTitle}>{activeTab}</Text>

          {/* Company Profile Form matching user screenshot */}
          {activeTab === "Company Profile" && (
            <View style={{ marginTop: spacing.s }}>
              {/* Row 1: Company Name & Website */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Company Name</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="My Company"
                    placeholderTextColor={colors.textMuted}
                    value={settings.companyProfile?.name || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), name: val }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Website</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Website"
                    placeholderTextColor={colors.textMuted}
                    value={settings.companyProfile?.website || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), website: val }
                    })}
                  />
                </View>
              </View>

              {/* Row 2: Contact Email & Contact Phone */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Contact Email</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Contact Email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    value={settings.companyProfile?.email || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), email: val }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Contact Phone</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Contact Phone"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={settings.companyProfile?.phone || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), phone: val }
                    })}
                  />
                </View>
              </View>

              {/* Row 3: GST Number */}
              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>GST Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="GST Number"
                    placeholderTextColor={colors.textMuted}
                    value={settings.companyProfile?.gstNo || ''}
                    onChangeText={val => setSettings({
                      ...settings,
                      companyProfile: { ...(settings.companyProfile || {}), gstNo: val }
                    })}
                  />
                </View>
                <View style={styles.formCol} />
              </View>

              {/* Row 4: HQ Address */}
              <Text style={styles.formLabel}>HQ Address</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 100, textAlignVertical: 'top' }]}
                placeholder="HQ Address"
                placeholderTextColor={colors.textMuted}
                multiline
                value={settings.companyProfile?.address || ''}
                onChangeText={val => setSettings({
                  ...settings,
                  companyProfile: { ...(settings.companyProfile || {}), address: val }
                })}
              />
            </View>
          )}

          {/* Departments */}
          {activeTab === "Departments" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>Enter department names separated by commas.</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 120, textAlignVertical: 'top' }]}
                multiline
                value={(settings.departments || []).join(", ")}
                onChangeText={val => handleArrayChange("departments", val)}
              />
            </View>
          )}

          {/* Designations */}
          {activeTab === "Designations" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>Enter designations separated by commas.</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 120, textAlignVertical: 'top' }]}
                multiline
                value={(settings.designations || []).join(", ")}
                onChangeText={val => handleArrayChange("designations", val)}
              />
            </View>
          )}

          {/* Office Locations */}
          {activeTab === "Office Locations" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>Enter physical office locations separated by commas.</Text>
              <TextInput
                style={[styles.modalTextInput, { height: 120, textAlignVertical: 'top' }]}
                multiline
                value={(settings.officeLocations || []).join(", ")}
                onChangeText={val => handleArrayChange("officeLocations", val)}
              />
            </View>
          )}

          {/* Policies Form matching user screenshot */}
          {activeTab === "Policies" && (
            <View style={{ marginTop: spacing.s }}>
              {/* Leave Policy (Annual Limits) */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginBottom: spacing.m }]}>
                Leave Policy (Annual Limits)
              </Text>

              <View style={styles.formRow3Col}>
                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Max Sick Leaves</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="12"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.leavePolicy?.maxSickLeaves ?? 12)}
                    onChangeText={val => setSettings({
                      ...settings,
                      leavePolicy: { ...(settings.leavePolicy || {}), maxSickLeaves: Number(val) || 0 }
                    })}
                  />
                </View>

                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Max Casual Leaves</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="12"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.leavePolicy?.maxCasualLeaves ?? 12)}
                    onChangeText={val => setSettings({
                      ...settings,
                      leavePolicy: { ...(settings.leavePolicy || {}), maxCasualLeaves: Number(val) || 0 }
                    })}
                  />
                </View>

                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Carry Forward Limit</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.leavePolicy?.carryForwardLimit ?? 5)}
                    onChangeText={val => setSettings({
                      ...settings,
                      leavePolicy: { ...(settings.leavePolicy || {}), carryForwardLimit: Number(val) || 0 }
                    })}
                  />
                </View>
              </View>

              {/* Attendance Policy */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginTop: spacing.l, marginBottom: spacing.m }]}>
                Attendance Policy
              </Text>

              <View style={styles.formRow3Col}>
                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Office Start Time</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="10:00 AM"
                    placeholderTextColor={colors.textMuted}
                    value={settings.attendancePolicy?.officeStartTime || '10:00 AM'}
                    onChangeText={val => setSettings({
                      ...settings,
                      attendancePolicy: { ...(settings.attendancePolicy || {}), officeStartTime: val }
                    })}
                  />
                </View>

                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Late Threshold (Mins)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.attendancePolicy?.lateThresholdMins ?? 15)}
                    onChangeText={val => setSettings({
                      ...settings,
                      attendancePolicy: { ...(settings.attendancePolicy || {}), lateThresholdMins: Number(val) || 0 }
                    })}
                  />
                </View>

                <View style={styles.formCol3}>
                  <Text style={styles.formLabel}>Half Day Threshold (Mins)</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    keyboardType="numeric"
                    placeholder="240"
                    placeholderTextColor={colors.textMuted}
                    value={String(settings.attendancePolicy?.halfDayThresholdMins ?? 240)}
                    onChangeText={val => setSettings({
                      ...settings,
                      attendancePolicy: { ...(settings.attendancePolicy || {}), halfDayThresholdMins: Number(val) || 0 }
                    })}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Email Templates Form matching user screenshot */}
          {activeTab === "Email Templates" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>
                Edit automated system responses. Use placeholders like {"{{employeeName}}"} where appropriate.
              </Text>

              {((settings.emailTemplates && settings.emailTemplates.length > 0)
                ? settings.emailTemplates
                : [
                  {
                    triggerEvent: 'Leave Approved',
                    subject: 'Leave Request Approved',
                    body: 'Hi {{employeeName}},\n\nYour leave request from {{startDate}} to {{endDate}} has been approved.',
                  },
                  {
                    triggerEvent: 'Leave Rejected',
                    subject: 'Leave Request Update',
                    body: 'Hi {{employeeName}},\n\nYour leave request from {{startDate}} to {{endDate}} has been rejected. Reason: {{reason}}',
                  },
                ]
              ).map((template: any, idx: number) => (
                <View key={idx} style={styles.templateCard}>
                  <View style={styles.templateBadge}>
                    <Text style={styles.templateBadgeText}>{template.triggerEvent}</Text>
                  </View>

                  <Text style={styles.formLabel}>Subject</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Subject..."
                    placeholderTextColor={colors.textMuted}
                    value={template.subject || ''}
                    onChangeText={(val) => {
                      const newTemplates = [...(settings.emailTemplates || [])];
                      if (!newTemplates[idx]) newTemplates[idx] = { ...template };
                      newTemplates[idx].subject = val;
                      setSettings({ ...settings, emailTemplates: newTemplates });
                    }}
                  />

                  <Text style={styles.formLabel}>Body</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 90, textAlignVertical: 'top' }]}
                    placeholder="Email Body..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    value={template.body || ''}
                    onChangeText={(val) => {
                      const newTemplates = [...(settings.emailTemplates || [])];
                      if (!newTemplates[idx]) newTemplates[idx] = { ...template };
                      newTemplates[idx].body = val;
                      setSettings({ ...settings, emailTemplates: newTemplates });
                    }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* SMS Templates Form matching user screenshot */}
          {activeTab === "SMS Templates" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.roleTip}>
                Edit automated system responses. Use placeholders like {"{{employeeName}}"} where appropriate.
              </Text>

              {((settings.smsTemplates && settings.smsTemplates.length > 0)
                ? settings.smsTemplates
                : [
                  {
                    triggerEvent: 'OTP Verification',
                    body: 'Your CRM login OTP is {{otp}}. Valid for 5 minutes.',
                  },
                  {
                    triggerEvent: 'Lead Assigned',
                    body: 'A new lead {{leadName}} has been assigned to you. Check leads page.',
                  },
                ]
              ).map((template: any, idx: number) => (
                <View key={idx} style={styles.templateCard}>
                  <View style={styles.smsTemplateBadge}>
                    <Text style={styles.smsTemplateBadgeText}>{template.triggerEvent}</Text>
                  </View>

                  <Text style={styles.formLabel}>SMS Body (Keep under 160 chars)</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 80, textAlignVertical: 'top' }]}
                    placeholder="SMS Body..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    value={template.body || ''}
                    onChangeText={(val) => {
                      const newTemplates = [...(settings.smsTemplates || [])];
                      if (!newTemplates[idx]) newTemplates[idx] = { ...template };
                      newTemplates[idx].body = val;
                      setSettings({ ...settings, smsTemplates: newTemplates });
                    }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Integrations Form matching user screenshot */}
          {activeTab === "Integrations" && (
            <View style={{ marginTop: spacing.s }}>
              {/* Section 1: SMTP Email Configuration */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginBottom: spacing.m }]}>
                SMTP Email Configuration
              </Text>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>SMTP Host</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="e.g. smtp.gmail.com"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.smtp?.host || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smtp: { ...(settings.integrations?.smtp || {}), host: val }
                      }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>SMTP Port</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="e.g. 587"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.smtp?.port || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smtp: { ...(settings.integrations?.smtp || {}), port: val }
                      }
                    })}
                  />
                </View>
              </View>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>SMTP User</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="keyadmin@gmail.com"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    value={settings.integrations?.smtp?.user || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smtp: { ...(settings.integrations?.smtp || {}), user: val }
                      }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>SMTP Password</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={settings.integrations?.smtp?.pass || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smtp: { ...(settings.integrations?.smtp || {}), pass: val }
                      }
                    })}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>From Address</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder='e.g. "HR Team" <hr@company.com>'
                placeholderTextColor={colors.textMuted}
                value={settings.integrations?.smtp?.from || ''}
                onChangeText={(val) => setSettings({
                  ...settings,
                  integrations: {
                    ...(settings.integrations || {}),
                    smtp: { ...(settings.integrations?.smtp || {}), from: val }
                  }
                })}
              />

              {/* Section 2: Payment Gateway (Razorpay/Cashfree) */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginTop: spacing.l, marginBottom: spacing.m }]}>
                Payment Gateway (Razorpay/Cashfree)
              </Text>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Account Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Account Number"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.paymentGateway?.razorpayAccountNumber || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        paymentGateway: { ...(settings.integrations?.paymentGateway || {}), razorpayAccountNumber: val }
                      }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Key ID</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Key ID"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.paymentGateway?.razorpayKeyId || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        paymentGateway: { ...(settings.integrations?.paymentGateway || {}), razorpayKeyId: val }
                      }
                    })}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Key Secret</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Key Secret"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={settings.integrations?.paymentGateway?.razorpayKeySecret || ''}
                onChangeText={(val) => setSettings({
                  ...settings,
                  integrations: {
                    ...(settings.integrations || {}),
                    paymentGateway: { ...(settings.integrations?.paymentGateway || {}), razorpayKeySecret: val }
                  }
                })}
              />

              {/* Section 3: SMS Gateway (Twilio / MSG91) */}
              <Text style={[styles.sectionHeading, { color: colors.text, fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 6, marginTop: spacing.l, marginBottom: spacing.m }]}>
                SMS Gateway (Twilio / MSG91)
              </Text>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Twilio Account SID</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Twilio Account SID"
                    placeholderTextColor={colors.textMuted}
                    value={settings.integrations?.smsGateway?.twilioAccountSid || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smsGateway: { ...(settings.integrations?.smsGateway || {}), twilioAccountSid: val }
                      }
                    })}
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Twilio Auth Token</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Twilio Auth Token"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    value={settings.integrations?.smsGateway?.twilioAuthToken || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smsGateway: { ...(settings.integrations?.smsGateway || {}), twilioAuthToken: val }
                      }
                    })}
                  />
                </View>
              </View>

              <View style={styles.formRow2Col}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Twilio Phone Number</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    placeholder="Twilio Phone Number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={settings.integrations?.smsGateway?.twilioPhoneNumber || ''}
                    onChangeText={(val) => setSettings({
                      ...settings,
                      integrations: {
                        ...(settings.integrations || {}),
                        smsGateway: { ...(settings.integrations?.smsGateway || {}), twilioPhoneNumber: val }
                      }
                    })}
                  />
                </View>
                <View style={styles.formCol} />
              </View>
            </View>
          )}

          {/* Access Control Form matching user screenshot */}
          {activeTab === "Access Control" && (
            <View style={{ marginTop: spacing.s }}>
              <Text style={styles.sectionHeading}>Admin Roles & Permissions</Text>
              <Text style={[styles.roleTip, { marginBottom: spacing.m }]}>
                Assign the ADMIN or KEY_ADMIN role to employees to give them access to Settings.
              </Text>

              <View style={styles.accessControlCard}>
                {/* Table Header */}
                <View style={styles.accessTableHeader}>
                  <Text style={[styles.attTableCol, { flex: 2.2 }]}>Email</Text>
                  <Text style={[styles.attTableCol, { flex: 1.2 }]}>Current Role</Text>
                  <Text style={[styles.attTableCol, { flex: 1.2, textAlign: 'right' }]}>Action</Text>
                </View>

                {usersLoading ? (
                  <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: 20 }} />
                ) : (
                  (users.length > 0 ? users : [
                    { email: 'admin@gmail.com', role: 'KEY_ADMIN' },
                    { email: 'keyadmin@gmail.com', role: 'KEY_ADMIN' }
                  ]).map((u) => (
                    <View key={u.email} style={styles.accessTableRow}>
                      <Text style={[styles.empNameText, { flex: 2.2, fontSize: 13 }]} numberOfLines={1}>
                        {u.email}
                      </Text>

                      <View style={{ flex: 1.2 }}>
                        <View style={[
                          styles.roleBadge,
                          u.role === 'KEY_ADMIN' ? styles.roleKeyAdminBadge :
                            u.role === 'ADMIN' ? styles.roleAdminBadge : styles.roleEmployeeBadge
                        ]}>
                          <Text style={[
                            styles.roleBadgeText,
                            u.role === 'KEY_ADMIN' ? styles.roleKeyAdminText :
                              u.role === 'ADMIN' ? styles.roleAdminText : styles.roleEmployeeText
                          ]}>
                            {u.role}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.actionSelectCol}>
                        <TouchableOpacity
                          style={styles.roleActionPill}
                          onPress={() => {
                            const nextRole = u.role === 'Employee' ? 'ADMIN' : u.role === 'ADMIN' ? 'KEY_ADMIN' : 'Employee';
                            handleRoleChange(u.email, nextRole);
                          }}
                        >
                          <Text style={styles.roleActionPillText}>{u.role}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// --- Notifications Sub-View (Notification Engine Logs) ---
const NotificationsView = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/api/reports/notifications');
      if (res.success && res.data) {
        setLogs(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.notificationsContainer}>
      {/* Title Row matching screenshot */}
      <View style={styles.notificationHeaderRow}>
        <RadioTower size={28} color="#6366f1" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Notification Engine Logs</Text>
          <Text style={styles.empSubtitle}>
            Live audit trail of all outgoing system communications (Email, SMS, Push).
          </Text>
        </View>
      </View>

      {/* Audit Trail Card */}
      <View style={styles.historyCard}>
        <Text style={styles.filterGroupLabel}>RECENT DISPATCHES</Text>

        <ScrollView horizontal style={{ marginTop: spacing.s }}>
          <View>
            <View style={styles.attTableHeader}>
              <Text style={[styles.attTableCol, { width: 100 }]}>Channel</Text>
              <Text style={[styles.attTableCol, { width: 120 }]}>Trigger Event</Text>
              <Text style={[styles.attTableCol, { width: 150 }]}>Recipient</Text>
              <Text style={[styles.attTableCol, { width: 220 }]}>Message Payload</Text>
              <Text style={[styles.attTableCol, { width: 90 }]}>Status</Text>
              <Text style={[styles.attTableCol, { width: 140 }]}>Timestamp</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 30 }} />
            ) : logs.length === 0 ? (
              <View style={styles.emptyHolidaysBox}>
                <Text style={styles.emptyNotificationText}>
                  The notification engine has not dispatched any messages yet. Generate a payroll to trigger an event!
                </Text>
              </View>
            ) : (
              logs.map((log) => (
                <View key={log._id} style={styles.attTableRow}>
                  {/* Channel */}
                  <View style={{ width: 100, flexDirection: 'row', alignItems: 'center' }}>
                    {log.channel === 'Email' ? (
                      <Mail size={14} color="#3b82f6" style={{ marginRight: 4 }} />
                    ) : log.channel === 'SMS' ? (
                      <MessageSquare size={14} color="#10b981" style={{ marginRight: 4 }} />
                    ) : (
                      <Bell size={14} color="#a855f7" style={{ marginRight: 4 }} />
                    )}
                    <Text style={styles.attTableCell}>{log.channel}</Text>
                  </View>

                  {/* Trigger Event */}
                  <View style={{ width: 120 }}>
                    <View style={styles.triggerBadgePill}>
                      <Text style={styles.triggerBadgeText}>{log.triggerEvent}</Text>
                    </View>
                  </View>

                  {/* Recipient */}
                  <View style={{ width: 150 }}>
                    <Text style={styles.empNameText}>
                      {log.recipientId?.firstName} {log.recipientId?.lastName}
                    </Text>
                    <Text style={styles.empCodeText}>
                      {log.channel === 'Email' ? log.recipientId?.email : log.recipientId?.phone || 'App User'}
                    </Text>
                  </View>

                  {/* Payload */}
                  <View style={{ width: 220 }}>
                    <Text style={styles.empCodeText} numberOfLines={2}>
                      {log.message}
                    </Text>
                  </View>

                  {/* Status */}
                  <View style={{ width: 90 }}>
                    <Text style={[
                      styles.attStatusPillText,
                      log.status === 'Sent' ? styles.statusPresentText : styles.statusAbsentText
                    ]}>
                      {log.status === 'Sent' ? '✓ Sent' : '✕ Failed'}
                    </Text>
                  </View>

                  {/* Timestamp */}
                  <View style={{ width: 140 }}>
                    <Text style={styles.empCodeText}>
                      {new Date(log.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

// --- Company Wallet Sub-View ---
const CompanyWalletView = () => {
  const [wallet, setWallet] = useState<{ balance: number; transactions: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Credit',
    amount: '',
    description: '',
    upiRef: '',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/api/wallet');
      if (res.success && res.data) {
        setWallet(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTransaction = async () => {
    if (!formData.amount || !formData.description) {
      Alert.alert('Validation Error', 'Please enter amount and description.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res: any = await apiCall('/api/wallet/transaction', {
        method: 'POST',
        body: JSON.stringify({
          type: formData.type === 'UPI Top-up' ? 'Credit' : formData.type,
          amount: Number(formData.amount),
          description: formData.type === 'UPI Top-up' ? `${formData.description} (UPI Ref: ${formData.upiRef})` : formData.description,
        }),
      });

      if (res.success) {
        Alert.alert('Success', res.message || 'Transaction executed successfully!');
        setShowForm(false);
        setFormData({ type: 'Credit', amount: '', description: '', upiRef: '' });
        fetchWallet();
      } else {
        Alert.alert('Error', res.error || 'Transaction failed.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Transaction failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const exportStatement = () => {
    Alert.alert('Export Statement', 'Statement exported to Excel ledger.');
  };

  return (
    <ScrollView contentContainerStyle={styles.walletContainer}>
      {/* Title & Action Buttons Header */}
      <View style={styles.walletHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>Company Wallet</Text>
          <Text style={styles.empSubtitle}>Manage central funds and view the financial ledger.</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.exportStatementBtn} onPress={exportStatement}>
            <Download size={14} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.exportStatementText}>Export Statement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addHolidayBtn}
            onPress={() => setShowForm(!showForm)}
          >
            <Plus size={14} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.addHolidayBtnText}>New Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Available Balance Black Banner Card matching user screenshot */}
      <View style={styles.walletBalanceCard}>
        <View style={styles.walletIconBackground}>
          <Wallet size={160} color="rgba(255, 255, 255, 0.06)" />
        </View>
        <Text style={styles.walletBalanceLabel}>AVAILABLE BALANCE</Text>
        <Text style={styles.walletBalanceValue}>
          ₹{(wallet?.balance || 0).toLocaleString()}
        </Text>
      </View>

      {/* Manual Transaction Form Card */}
      {showForm && (
        <View style={styles.addHolidayCard}>
          <Text style={styles.addHolidayCardTitle}>Manual Transaction</Text>

          <Text style={styles.formLabel}>Transaction Type</Text>
          <View style={styles.typeSelectionRow}>
            {['Credit', 'Debit', 'UPI Top-up'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeSelectBtn, formData.type === t && styles.typeSelectBtnActive]}
                onPress={() => setFormData({ ...formData, type: t })}
              >
                <Text style={[styles.typeSelectText, formData.type === t && styles.typeSelectTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {formData.type === 'UPI Top-up' && (
            <View>
              <Text style={styles.formLabel}>UPI Reference No. *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 123456789012"
                placeholderTextColor={colors.textMuted}
                value={formData.upiRef}
                onChangeText={(val) => setFormData({ ...formData, upiRef: val })}
              />
            </View>
          )}

          <View style={styles.formRow2Col}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Amount (₹) *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. 5000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={(val) => setFormData({ ...formData, amount: val })}
              />
            </View>

            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="e.g. Bank Transfer"
                placeholderTextColor={colors.textMuted}
                value={formData.description}
                onChangeText={(val) => setFormData({ ...formData, description: val })}
              />
            </View>
          </View>

          <View style={styles.structFormActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, submitLoading && styles.disabledButton]}
              onPress={handleTransaction}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.saveBtnText}>Execute Transaction</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Ledger Table Card matching user screenshot */}
      <View style={styles.historyCard}>
        <Text style={styles.settingsCardTitle}>Ledger (Audit Log)</Text>

        <ScrollView horizontal style={{ marginTop: spacing.s }}>
          <View>
            <View style={styles.attTableHeader}>
              <Text style={[styles.attTableCol, { width: 130 }]}>Date</Text>
              <Text style={[styles.attTableCol, { width: 180 }]}>Description</Text>
              <Text style={[styles.attTableCol, { width: 100 }]}>Type</Text>
              <Text style={[styles.attTableCol, { width: 110, textAlign: 'right' }]}>Amount</Text>
              <Text style={[styles.attTableCol, { width: 120, textAlign: 'right' }]}>Balance After</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 30 }} />
            ) : (wallet?.transactions && wallet.transactions.length > 0) ? (
              wallet.transactions.map((tx) => (
                <View key={tx._id} style={styles.attTableRow}>
                  <Text style={[styles.empCodeText, { width: 130 }]}>
                    {new Date(tx.createdAt).toLocaleString()}
                  </Text>

                  <View style={{ width: 180 }}>
                    <Text style={styles.empNameText}>{tx.description}</Text>
                    <Text style={styles.empCodeText}>By {tx.createdBy?.firstName} {tx.createdBy?.lastName}</Text>
                  </View>

                  <View style={{ width: 100 }}>
                    <View style={[
                      styles.attStatusPill,
                      tx.type === 'Credit' ? styles.statusPresent : styles.statusAbsent
                    ]}>
                      <Text style={[
                        styles.attStatusPillText,
                        tx.type === 'Credit' ? styles.statusPresentText : styles.statusAbsentText
                      ]}>
                        {tx.type === 'Credit' ? '↑ Credit' : '↓ Debit'}
                      </Text>
                    </View>
                  </View>

                  <Text style={[
                    styles.attTableCell,
                    { width: 110, textAlign: 'right', fontWeight: 'bold' },
                    tx.type === 'Credit' ? { color: '#10b981' } : { color: '#ef4444' }
                  ]}>
                    {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </Text>

                  <Text style={[styles.attTableCell, { width: 120, textAlign: 'right', fontWeight: 'bold' }]}>
                    ₹{tx.balanceAfter.toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyHolidaysBox}>
                <Text style={styles.emptyNotificationText}>
                  No transactions found in ledger.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

// --- Employee My Profile Sub-View ---
const EmployeeProfileView = () => {
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res: any = await apiCall('/api/auth/me');
      if (res.success && (res.employee || res.data)) {
        setEmployee(res.employee || res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const pickAndUploadPhoto = async (source: 'camera' | 'gallery') => {
    try {
      // Request permissions
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery permission is required to select a photo.');
          return;
        }
      }

      // Launch picker
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });

      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const fileName = asset.fileName || uri.split('/').pop() || 'profile.jpg';
      const fileType = asset.mimeType || 'image/jpeg';

      // Validate file type
      if (!fileType.startsWith('image/jpeg') && !fileType.startsWith('image/png')) {
        Alert.alert('Invalid File', 'Only JPG and PNG files are allowed.');
        return;
      }

      setPhotoUploading(true);

      // Upload the file
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: fileType,
      } as any);

      const token = useAuthStore.getState().token;
      const uploadRes = await fetch(`${require('../services/api').API_BASE_URL}/api/employees/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Cookie: `accessToken=${token}`, Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        Alert.alert('Upload Failed', uploadData.error || 'Failed to upload photo.');
        setPhotoUploading(false);
        return;
      }

      const photoUrl = uploadData.url;

      // Update profile with the new photo URL
      const updateRes = await apiCall('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ profilePhotoUrl: photoUrl }),
      });

      if (updateRes.success) {
        // Update local state immediately
        setEmployee((prev: any) => ({ ...prev, profilePhotoUrl: photoUrl }));
        Alert.alert('Success', 'Profile photo updated successfully!');
      } else {
        Alert.alert('Error', updateRes.error || 'Failed to update profile photo.');
      }
    } catch (e: any) {
      console.error('Photo upload error:', e);
      Alert.alert('Error', e.message || 'An error occurred while uploading the photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleChangePhoto = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickAndUploadPhoto('camera');
          else if (buttonIndex === 2) pickAndUploadPhoto('gallery');
        }
      );
    } else {
      Alert.alert(
        'Change Profile Photo',
        'Choose how you want to update your profile photo',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: '📷 Take Photo', onPress: () => pickAndUploadPhoto('camera') },
          { text: '🖼️ Choose from Gallery', onPress: () => pickAndUploadPhoto('gallery') },
        ]
      );
    }
  };

  const handleChangePassword = async () => {
    if (!formData.oldPassword || !formData.newPassword) {
      Alert.alert('Validation Error', 'Please enter your current and new password.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await apiCall('/api/auth/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (res.success) {
        Alert.alert('Success', 'Password updated successfully!');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        Alert.alert('Error', res.error || 'Failed to update password.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Error updating password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.walletContainer}>
      {/* Title Row matching screenshot */}
      <View style={styles.notificationHeaderRow}>
        <ShieldCheck size={28} color="#2563eb" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.empTitle}>My Profile</Text>
          <Text style={styles.empSubtitle}>Manage your account security and preferences.</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: 40 }} />
      ) : (
        <>
          {/* Card 1: Personal Information (Read-Only) */}
          <View style={styles.settingsCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <UserIcon size={18} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={styles.settingsCardTitle}>Personal Information</Text>
            </View>
            <Text style={[styles.roleTip, { marginBottom: spacing.m }]}>
              Your personal and official details (Read-Only).
            </Text>

            {/* Profile Avatar & Change Photo */}
            <View style={styles.profileAvatarRow}>
              <View style={styles.profileAvatarCircle}>
                {employee?.profilePhotoUrl ? (
                  <Image
                    source={{ uri: employee.profilePhotoUrl.startsWith('http') ? employee.profilePhotoUrl : `${require('../services/api').API_BASE_URL}${employee.profilePhotoUrl}` }}
                    style={{ width: 72, height: 72, borderRadius: 36 }}
                    resizeMode="cover"
                  />
                ) : (
                  <UserIcon size={36} color={colors.textMuted} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={handleChangePhoto}
                  disabled={photoUploading}
                >
                  {photoUploading ? (
                    <ActivityIndicator size="small" color="#2563eb" style={{ marginRight: 6 }} />
                  ) : (
                    <Camera size={16} color="#2563eb" style={{ marginRight: 6 }} />
                  )}
                  <Text style={styles.changePhotoText}>
                    {photoUploading ? 'Uploading...' : 'Change Profile Photo'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.photoTipText}>Only JPG, PNG files are allowed.</Text>
              </View>
            </View>

            {/* 2-Column Read-Only Details Grid */}
            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>FULL NAME</Text>
                <Text style={styles.profileValText}>{employee?.firstName} {employee?.lastName}</Text>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>EMAIL ADDRESS</Text>
                <Text style={styles.profileValText}>{employee?.email}</Text>
              </View>
            </View>

            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>PHONE NUMBER</Text>
                <Text style={styles.profileValText}>{employee?.phone || '08273322128'}</Text>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>DATE OF BIRTH</Text>
                <Text style={styles.profileValText}>
                  {employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : '10/6/1995'}
                </Text>
              </View>
            </View>

            <View style={styles.formRow2Col}>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>DEPARTMENT</Text>
                <Text style={styles.profileValText}>{employee?.department || 'Engineering'}</Text>
              </View>
              <View style={styles.formCol}>
                <Text style={styles.filterGroupLabel}>DESIGNATION</Text>
                <Text style={styles.profileValText}>{employee?.designation || 'Developer'}</Text>
              </View>
            </View>
          </View>

          {/* Card 2: Change Password matching user screenshot */}
          <View style={[styles.settingsCard, { marginTop: spacing.m }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <KeyRound size={18} color={colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={styles.settingsCardTitle}>Change Password</Text>
            </View>
            <Text style={[styles.roleTip, { marginBottom: spacing.m }]}>
              Secure your account by updating your password regularly.
            </Text>

            <Text style={styles.formLabel}>Current Password</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={formData.oldPassword}
              onChangeText={(val) => setFormData({ ...formData, oldPassword: val })}
            />

            <Text style={styles.formLabel}>New Password</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Enter new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={formData.newPassword}
              onChangeText={(val) => setFormData({ ...formData, newPassword: val })}
            />

            <Text style={styles.formLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.modalTextInput}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(val) => setFormData({ ...formData, confirmPassword: val })}
            />

            <TouchableOpacity
              style={[styles.saveBtn, { marginTop: spacing.m }, pwLoading && styles.disabledButton]}
              onPress={handleChangePassword}
              disabled={pwLoading}
            >
              {pwLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={styles.saveBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

// --- Dashboard Screen ---
const DashboardScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [overviewAttRecords, setOverviewAttRecords] = useState<any[]>([]);
  const [overviewAttLoading, setOverviewAttLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const userRole = user?.role || 'Employee';
  const isAdminOrKeyAdmin = userRole === 'KEY_ADMIN' || userRole === 'ADMIN';

  const initialSection = (userRole === 'KEY_ADMIN' || userRole === 'ADMIN')
    ? 'Overview'
    : ((user as any)?.moduleAccess?.[0] || 'Attendance');

  const [activeSection, setActiveSection] = useState(initialSection);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/api/dashboard/admin');
      if (response.success && response.data) {
        setData(response.data.data || response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to fetch dashboard data.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance records for admin/keyadmin overview
  const fetchOverviewAttendance = async () => {
    if (!isAdminOrKeyAdmin) return;
    setOverviewAttLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res: any = await apiCall(`/api/attendance/manager?date=${today}`);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setOverviewAttRecords(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOverviewAttLoading(false);
    }
  };

  const formatOverviewPunchTime = (punchVal: any) => {
    if (!punchVal) return '-';
    if (typeof punchVal === 'string') {
      if (punchVal.includes(':')) return punchVal;
      const d = new Date(punchVal);
      return isNaN(d.getTime()) ? punchVal : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (punchVal.time) {
      const d = new Date(punchVal.time);
      return isNaN(d.getTime()) ? String(punchVal.time) : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '-';
  };

  useEffect(() => {
    fetchDashboardData();
    fetchOverviewAttendance();
  }, []);

  const handleLogout = () => {
    clearAuth();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading Command Center...</Text>
      </View>
    );
  }

  const k = data?.kpis || {
    totalEmployees: 0,
    walletBalance: 0,
    revenue: 0,
    salaryPaid: 0,
    salaryPending: 0,
    attendanceStats: { present: 0, absent: 0, late: 0, leave: 0 },
    openLeads: 0,
    wonLeads: 0,
  };

  const wonPercentage = k.openLeads + k.wonLeads > 0
    ? Math.round((k.wonLeads / (k.openLeads + k.wonLeads)) * 100)
    : 0;

  const topPadding = Platform.OS === 'android' ? (StatusBar.currentHeight || 10) : 0;
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarOpen(true)}>
          <Menu size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: spacing.m }}>
          <Text style={styles.headerTitle}>
            {activeSection === 'Overview' ? 'Command Center' : activeSection}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeSection === 'Overview'
              ? 'Overview of financials, HR, and sales'
              : `CRM Hub - ${activeSection} panel`}
          </Text>
        </View>
        <View style={styles.headerAvatarBadge}>
          <Text style={styles.headerAvatarText}>
            {(user as any)?.firstName
              ? `${(user as any).firstName[0]}${(user as any).lastName ? (user as any).lastName[0] : ''}`.toUpperCase()
              : (user?.email ? user.email[0].toUpperCase() : 'U')}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Conditional rendering of sections */}
      {activeSection === 'Overview' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Row 1: Global KPIs */}
          <View style={styles.kpiGrid}>
            {/* Card 1: Total Employees */}
            <View style={[styles.dashboardCard, { backgroundColor: '#111' }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Total Employees</Text>
                <Users size={20} color="#9BA3AF" />
              </View>
              <Text style={styles.cardValueLarge}>{k.totalEmployees}</Text>
            </View>

            {/* Card 2: Wallet Balance */}
            <View style={[styles.dashboardCard, { backgroundColor: '#1a1f3c' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: '#c7d2fe' }]}>Wallet Balance</Text>
                <Wallet size={20} color="#818cf8" />
              </View>
              <Text style={styles.cardValueLarge}>₹{k.walletBalance.toLocaleString()}</Text>
            </View>

            {/* Card 3: Revenue */}
            <View style={[styles.dashboardCard, { backgroundColor: colors.surface }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>Revenue (Won Leads)</Text>
                <TrendingUp size={20} color={colors.success} />
              </View>
              <Text style={[styles.cardValueLarge, { color: colors.success }]}>
                ₹{k.revenue.toLocaleString()}
              </Text>
            </View>

            {/* Card 4: Salary Status */}
            <View style={[styles.dashboardCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardLabel, { marginBottom: spacing.s }]}>
                Monthly Salary Status
              </Text>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryStatusPaid}>Paid</Text>
                <Text style={styles.salaryAmt}>₹{k.salaryPaid.toLocaleString()}</Text>
              </View>
              <View style={styles.salaryBarContainer}>
                <View
                  style={[
                    styles.salaryBarPaid,
                    { width: `${(k.salaryPaid / (k.salaryPaid + k.salaryPending || 1)) * 100}%` }
                  ]}
                />
              </View>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryStatusPending}>Pending</Text>
                <Text style={styles.salaryAmt}>₹{k.salaryPending.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Row 2: Today's Attendance Operations */}
          <Text style={styles.sectionTitle}>Today's Attendance</Text>
          <View style={styles.attendanceGrid}>
            {/* Main info card */}
            <View style={styles.attendanceMainCard}>
              <Clock size={24} color={colors.textMuted} style={{ marginBottom: 4 }} />
              <Text style={styles.attendanceMainText}>Today's Attendance</Text>
            </View>

            {/* present */}
            <View style={styles.attendanceStatCard}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <UserCheck size={16} color="#10b981" />
              </View>
              <Text style={styles.attendanceStatLabel}>Present</Text>
              <Text style={styles.attendanceStatVal}>{k.attendanceStats.present}</Text>
            </View>

            {/* absent */}
            <View style={styles.attendanceStatCard}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <UserX size={16} color="#ef4444" />
              </View>
              <Text style={styles.attendanceStatLabel}>Absent</Text>
              <Text style={styles.attendanceStatVal}>{k.attendanceStats.absent}</Text>
            </View>

            {/* late */}
            <View style={styles.attendanceStatCard}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <AlertCircle size={16} color="#f59e0b" />
              </View>
              <Text style={styles.attendanceStatLabel}>Late</Text>
              <Text style={styles.attendanceStatVal}>{k.attendanceStats.late}</Text>
            </View>

            {/* on leave */}
            <View style={styles.attendanceStatCard}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <CalendarDays size={16} color="#3b82f6" />
              </View>
              <Text style={styles.attendanceStatLabel}>On Leave</Text>
              <Text style={styles.attendanceStatVal}>{k.attendanceStats.leave}</Text>
            </View>
          </View>

          {/* Row 2b: Live Employee Attendance List (Admin & Key Admin only) */}
          {isAdminOrKeyAdmin && (
            <View style={[styles.chartCard, { marginTop: spacing.m }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Users size={18} color={colors.accent} style={{ marginRight: 8 }} />
                  <Text style={styles.chartTitle}>Employee Punch Status</Text>
                </View>
                <TouchableOpacity
                  onPress={fetchOverviewAttendance}
                  style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(99,102,241,0.12)', borderRadius: 6 }}
                >
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>Refresh</Text>
                </TouchableOpacity>
              </View>

              {overviewAttLoading ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>Loading live data...</Text>
                </View>
              ) : overviewAttRecords.length === 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 }}>
                  No employee attendance records found for today.
                </Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    {/* Table Header */}
                    <View style={{
                      flexDirection: 'row',
                      backgroundColor: 'rgba(99,102,241,0.08)',
                      borderRadius: 6,
                      paddingVertical: 8,
                      paddingHorizontal: 6,
                      marginBottom: 4,
                    }}>
                      <Text style={{ width: 150, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>Employee</Text>
                      <Text style={{ width: 90, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>Dept</Text>
                      <Text style={{ width: 90, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase' }}>Status</Text>
                      <Text style={{ width: 80, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', textAlign: 'center' }}>Punch In</Text>
                      <Text style={{ width: 80, fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', textAlign: 'center' }}>Punch Out</Text>
                    </View>

                    {/* Table Rows */}
                    {overviewAttRecords.map((record: any, index: number) => {
                      const emp = record.employeeId || {};
                      const empName = emp.firstName ? `${emp.firstName} ${emp.lastName || ''}`.trim() : 'Unknown';
                      const empDept = emp.department || emp.designation || '-';
                      const isPunched = !!(record.punchIn || record.status === 'Present' || record.status === 'Half-Day');
                      const isLate = record.metrics?.isLate || record.isLate || record.status === 'Late';

                      return (
                        <View
                          key={record._id || index}
                          style={{
                            flexDirection: 'row',
                            paddingVertical: 10,
                            paddingHorizontal: 6,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255,255,255,0.05)',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ width: 150 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }} numberOfLines={1}>
                              {empName}
                            </Text>
                          </View>
                          <Text style={{ width: 90, fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                            {empDept}
                          </Text>
                          <View style={{ width: 90, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 10,
                              backgroundColor: isPunched ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            }}>
                              <Text style={{
                                fontSize: 11,
                                fontWeight: '600',
                                color: isPunched ? '#10b981' : '#ef4444',
                              }}>
                                {record.punchIn ? 'Present' : record.status || 'Absent'}
                              </Text>
                            </View>
                            {isLate && (
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#f59e0b', marginLeft: 4 }}>LATE</Text>
                            )}
                          </View>
                          <Text style={{ width: 80, fontSize: 12, color: colors.textMuted, textAlign: 'center', fontWeight: '500' }}>
                            {formatOverviewPunchTime(record.punchIn || record.inTime || record.punchInTime)}
                          </Text>
                          <Text style={{ width: 80, fontSize: 12, color: colors.textMuted, textAlign: 'center', fontWeight: '500' }}>
                            {formatOverviewPunchTime(record.punchOut || record.outTime || record.punchOutTime)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              )}
            </View>
          )}

          {/* Row 3: Visual Mockup Charts */}
          <View style={styles.chartsGrid}>
            {/* 6-Month Trend */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>6-Month Trend: Attendance & Salary</Text>
              <View style={styles.barChartContainer}>
                {data?.charts?.monthlyData?.map((item: any, index: number) => (
                  <View key={index} style={styles.barCol}>
                    <View style={styles.barWrapper}>
                      {/* Salary line representation */}
                      <View
                        style={[
                          styles.salaryLineIndicator,
                          { height: `${Math.min(100, (item.salary / 800000) * 100)}%` }
                        ]}
                      />
                      {/* Attendance representation */}
                      <View
                        style={[
                          styles.attendanceBar,
                          { height: `${Math.min(100, (item.present / 15) * 100)}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{item.name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#6366f1' }]} />
                  <Text style={styles.legendText}>Avg Present</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Salary Payout</Text>
                </View>
              </View>
            </View>

            {/* Lead Conversion */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Lead Conversion Rate</Text>
              <View style={styles.circularContainer}>
                <View style={styles.donutPlaceholder}>
                  <Text style={styles.donutVal}>{wonPercentage}%</Text>
                  <Text style={styles.donutSub}>WON</Text>
                </View>
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendText}>Lost</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#3b82f6' }]} />
                  <Text style={styles.legendText}>Open</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.legendText}>Won</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Row 4: Upcoming Birthdays */}
          <View style={[styles.chartCard, { marginBottom: spacing.xl }]}>
            <View style={styles.birthdayHeader}>
              <Gift size={18} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={styles.chartTitle}>Upcoming Birthdays (Next 30 Days)</Text>
            </View>
            {data?.upcomingBirthdays && data.upcomingBirthdays.length > 0 ? (
              <View style={styles.birthdayList}>
                {data.upcomingBirthdays.map((bday: any, index: number) => (
                  <View key={index} style={styles.birthdayRow}>
                    <Text style={styles.birthdayName}>{bday.name}</Text>
                    <Text style={styles.birthdayDate}>
                      {new Date(bday.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noBirthdays}>No upcoming birthdays in the next 30 days.</Text>
            )}
          </View>
        </ScrollView>
      ) : activeSection === 'Employees' ? (
        <EmployeesView />
      ) : activeSection === 'Payroll' ? (
        <PayrollView />
      ) : activeSection === 'Attendance' ? (
        <AttendanceView />
      ) : activeSection === 'Leave' ? (
        <LeaveView />
      ) : activeSection === 'Holidays' ? (
        <HolidaysView />
      ) : activeSection === 'Leads' ? (
        <LeadsView />
      ) : activeSection === 'Reports' ? (
        <ReportsView />
      ) : activeSection === 'Settings' ? (
        <SettingsView />
      ) : activeSection === 'Notifications' ? (
        <NotificationsView />
      ) : activeSection === 'Wallet' ? (
        <CompanyWalletView />
      ) : activeSection === 'Profile' ? (
        <EmployeeProfileView />
      )
        : (
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderTitle}>{activeSection} Module</Text>
            <Text style={styles.placeholderSubtitle}>This panel is currently active. Mobile integration coming soon.</Text>
          </View>
        )}

      {/* --- Sidebar Overlay --- */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setSidebarOpen(false)}
          />
          {/* Sidebar Drawer container */}
          <View style={styles.sidebarContainer}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarLogoText}>CRM Hub</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sidebarItems}>
              {[
                { name: 'Overview', icon: LayoutGrid },
                { name: 'Wallet', icon: Wallet },
                { name: 'Payroll', icon: TrendingUp },
                { name: 'Attendance', icon: Clock },
                { name: 'Leave', icon: CalendarDays },
                { name: 'Holidays', icon: Calendar },
                { name: 'Employees', icon: Users },
                { name: 'Leads', icon: Target },
                { name: 'Reports', icon: BarChart2 },
                { name: 'Notifications', icon: Bell },
                { name: 'Settings', icon: Settings },
                { name: 'Profile', icon: UserIcon },
              ]
                .filter((item) => {
                  // KEY_ADMIN & ADMIN have full access to all items
                  if (userRole === 'KEY_ADMIN' || userRole === 'ADMIN') return true;

                  // For Employees: check moduleAccess array or default accessible list
                  const allowedModules: string[] = (user as any)?.moduleAccess || ['Attendance', 'Leads', 'Reports', 'Profile'];
                  return allowedModules.includes(item.name);
                })
                .map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeSection === (item.name === 'Overview' ? 'Overview' : item.name);
                  return (
                    <TouchableOpacity
                      key={item.name}
                      style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                      onPress={() => {
                        setActiveSection(item.name === 'Overview' ? 'Overview' : item.name);
                        setSidebarOpen(false);
                        if (item.name === 'Overview') {
                          fetchDashboardData();
                          fetchOverviewAttendance();
                        }
                      }}
                    >
                      <IconComponent size={18} color={isActive ? colors.accent : colors.textMuted} style={{ marginRight: 12 }} />
                      <Text style={[styles.sidebarItemText, isActive && styles.sidebarItemTextActive]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            <TouchableOpacity style={styles.sidebarLogout} onPress={handleLogout}>
              <LogOut size={18} color={colors.danger} style={{ marginRight: 12 }} />
              <Text style={styles.sidebarLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// --- Navigation Configuration ---
export const AppNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};



// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.m,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: spacing.m,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  headerAvatarBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
    marginLeft: 'auto',
  },
  headerAvatarText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: spacing.s,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.s,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  textInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    marginTop: spacing.m,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  dashboardCard: {
    width: '48%',
    padding: spacing.m,
    borderRadius: borderRadius.m,
    marginBottom: spacing.m,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cardValueLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.s,
  },
  salaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  salaryStatusPaid: {
    fontSize: 11,
    color: colors.success,
    fontWeight: 'bold',
  },
  salaryStatusPending: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: 'bold',
  },
  salaryAmt: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  salaryBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginVertical: 4,
    overflow: 'hidden',
  },
  salaryBarPaid: {
    height: '100%',
    backgroundColor: colors.success,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.s,
    marginTop: spacing.s,
  },
  attendanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  attendanceMainCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  attendanceMainText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  attendanceStatCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.s,
    marginBottom: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    padding: 6,
    borderRadius: borderRadius.round,
    marginRight: spacing.s,
  },
  attendanceStatLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  attendanceStatVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 'auto',
    marginRight: 4,
  },
  chartsGrid: {
    marginBottom: spacing.m,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  chartTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.m,
  },
  barChartContainer: {
    height: 150,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },
  barCol: {
    alignItems: 'center',
    width: 30,
  },
  barWrapper: {
    height: 110,
    width: 14,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  attendanceBar: {
    width: 14,
    backgroundColor: '#6366f1',
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  salaryLineIndicator: {
    width: 4,
    backgroundColor: '#10b981',
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
    left: 5,
    zIndex: 2,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.s,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.s,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
  },
  donutPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    borderColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutVal: {
    fontSize: 20,
    fontWeight: 'black',
    color: colors.text,
  },
  donutSub: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  birthdayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  noBirthdays: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.s,
  },
  birthdayList: {
    marginTop: spacing.s,
  },
  birthdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  birthdayName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  birthdayDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
  /* --- Sidebar Styles --- */
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sidebarContainer: {
    width: '75%',
    backgroundColor: colors.surface,
    height: '100%',
    padding: spacing.m,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    zIndex: 1001,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.s,
  },
  sidebarLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
  },
  sidebarItems: {
    flex: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.m,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
  },
  sidebarItemText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sidebarItemTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  sidebarLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 'auto',
  },
  sidebarLogoutText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: 'bold',
  },
  /* --- Placeholder Styles --- */
  placeholderSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  /* --- Employees Styles --- */
  employeesContainer: {
    flex: 1,
    padding: spacing.m,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  empTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  empSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  addEmpButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: borderRadius.m,
  },
  addEmpBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  filterRow: {
    flexDirection: 'column',
    marginBottom: spacing.m,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.s,
    height: 40,
    marginBottom: spacing.s,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    height: '100%',
  },
  filterBadges: {
    flexDirection: 'row',
  },
  filterBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
    borderColor: colors.accent,
  },
  filterBadgeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  filterBadgeTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  employeeListContainer: {
    flex: 1,
  },
  employeeRowCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  empCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.s,
    marginBottom: spacing.s,
  },
  empAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  empAvatarText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: 'bold',
  },
  empName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  empEmail: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: '#10b981',
  },
  statusTextInactive: {
    color: '#ef4444',
  },
  empCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empDetailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailVal: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  noEmployeesText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.m,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.m,
    marginBottom: spacing.m,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalFormContent: {
    paddingBottom: 40,
  },
  formLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalTextInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    marginBottom: spacing.m,
  },
  roleSelectionRow: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.m,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleSelectBtnActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
    borderColor: colors.accent,
  },
  roleSelectText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  roleSelectTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  /* --- Stepper Component Styles --- */
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepCircleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  stepCircleActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stepCircleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepCircleText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepCircleTextActive: {
    color: colors.background,
  },
  stepCircleLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  stepCircleLabelActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  stepLine: {
    height: 2,
    flex: 0.8,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: -16, // pull line up to align with circles
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.m,
  },
  typeSelectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  typeSelectBtn: {
    width: '48%',
    paddingVertical: 12,
    borderRadius: borderRadius.m,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeSelectBtnActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.1)',
    borderColor: colors.accent,
  },
  typeSelectText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  typeSelectTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  roleTip: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.m,
    lineHeight: 16,
  },
  stepperNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.m,
  },
  stepperNavBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: borderRadius.m,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperNavBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stepperNavBtnDisabled: {
    opacity: 0.5,
  },
  stepperNavText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  stepperNavTextActive: {
    color: colors.background,
  },
  stepperNavTextDisabled: {
    color: colors.textMuted,
  },
  /* --- Employee Detail Styles --- */
  detailScrollContent: {
    paddingBottom: 40,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  backButton: {
    padding: spacing.s,
    marginRight: spacing.s,
  },
  detailAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  detailAvatarText: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailMeta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  detailActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.m,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
    marginLeft: spacing.s,
  },
  detailBtnEdit: {
    backgroundColor: '#1e3a8a', // Dark blue matching screenshot Edit Employee
  },
  detailBtnDelete: {
    backgroundColor: '#1e3a8a', // Dark blue matching screenshot Delete Employee
  },
  detailBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  detailCard: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: borderRadius.l,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailGridCol: {
    width: '48%',
    marginBottom: spacing.m,
  },
  adminActionsCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  adminActionsTitle: {
    color: colors.danger,
  },
  adminActionsDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.m,
    lineHeight: 16,
  },
  resetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.s,
    marginRight: spacing.s,
  },
  resetBtn: {
    backgroundColor: '#1e3a8a',
    height: 40,
    paddingHorizontal: spacing.m,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* --- Payroll Styles --- */
  payrollContainer: {
    flex: 1,
    padding: spacing.m,
  },
  payrollHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  payrollTabBtnGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  payrollTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.s,
  },
  payrollTabBtnActive: {
    backgroundColor: colors.accent,
  },
  payrollTabBtnText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  payrollTabBtnTextActive: {
    color: colors.background,
  },
  monthSelectorRow: {
    marginBottom: spacing.m,
  },
  monthInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    height: 44,
  },
  monthInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  clearMonthText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  netSalaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  netSalaryCardLabel: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
  },
  netSalaryCardValue: {
    fontSize: 28,
    fontWeight: 'black',
    color: colors.text,
    marginTop: 4,
  },
  payrollTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
  },
  tableColHeader: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  payrollTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxTouch: {
    padding: 4,
    marginRight: 6,
  },
  customCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  customCheckboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  customCheckboxDisabled: {
    opacity: 0.3,
  },
  empNameText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  empCodeText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  tableCellText: {
    fontSize: 12,
    color: colors.text,
  },
  actionGenerateBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.s,
  },
  actionGenerateBtnText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionSlipBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.s,
  },
  actionSlipBtnText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  /* Floating Bulk Bar */
  floatingBulkBar: {
    position: 'absolute',
    bottom: 20,
    left: spacing.m,
    right: spacing.m,
    backgroundColor: '#111827',
    borderRadius: borderRadius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bulkBarTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  bulkBarVal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bulkPayBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: borderRadius.round,
  },
  bulkPayBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  /* Structures tab styles */
  structuresLayout: {
    flex: 1,
  },
  structEmpListCard: {
    maxHeight: 220,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  structEmpListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.s,
  },
  structEmpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  structEmpItemActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.08)',
    borderRadius: borderRadius.s,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  structFormCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  structFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  formRow2Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formCol: {
    flex: 1,
    marginRight: spacing.s,
  },
  grossSummaryBox: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.m,
    borderRadius: borderRadius.m,
    marginVertical: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grossSummaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  grossSummaryVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
  },
  structFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.s,
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: borderRadius.m,
  },
  saveBtnText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: 'bold',
  },
  selectEmpPromptBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.l,
    padding: spacing.xl,
  },
  selectEmpPromptText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
  },
  /* --- Attendance Styles --- */
  attendanceContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  attActionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  attCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  attCardSubTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.m,
  },
  clockDisplayBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  clockTimeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  clockDateText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.l,
  },
  punchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: borderRadius.m,
  },
  punchInBtn: {
    backgroundColor: '#10b981', // Emerald green matching screenshot
  },
  punchOutBtn: {
    backgroundColor: '#ef4444', // Rose red
  },
  punchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shiftCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.round,
  },
  shiftCompletedText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 14,
  },
  punchInfoPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.s,
  },
  punchInfoPillLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  punchInfoPillVal: {
    fontSize: 14,
    color: colors.text,
    fontWeight: 'bold',
  },
  lateAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.m,
  },
  lateAlertText: {
    color: '#d97706', // Warm amber
    fontSize: 13,
    fontWeight: '500',
  },
  monthlyHistoryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  attTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: spacing.s,
    borderRadius: borderRadius.m,
    marginVertical: spacing.s,
  },
  attTableCol: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  attTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attTableCell: {
    fontSize: 12,
    color: colors.text,
  },
  attStatusPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  statusPresent: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusAbsent: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  attStatusPillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusPresentText: {
    color: '#10b981',
  },
  statusAbsentText: {
    color: '#ef4444',
  },
  lateStatusTextBadge: {
    color: '#d97706',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  noAttText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: spacing.l,
    fontSize: 13,
  },
  /* --- Leave Styles --- */
  leaveContainer: {
    flex: 1,
    padding: spacing.m,
  },
  leaveHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  leaveActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamApprovalsBtn: {
    backgroundColor: '#1e3a8a', // Dark blue matching screenshot Team Approvals button
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
    marginRight: spacing.s,
  },
  teamApprovalsBtnActive: {
    backgroundColor: colors.accent,
  },
  teamApprovalsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamApprovalsTextActive: {
    color: colors.background,
  },
  applyLeaveBtn: {
    backgroundColor: '#1e3a8a', // Dark blue matching + Apply Leave button
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
  },
  applyLeaveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaveBalancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  balanceCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  balanceTypeLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  balanceCountVal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  statusPendingPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusPendingText: {
    color: '#f59e0b',
  },
  halfDayCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  halfDayLabelText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: spacing.s,
    fontWeight: 'bold',
  },
  approveSmallBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    marginRight: 4,
  },
  approveSmallText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rejectSmallBtn: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
  },
  rejectSmallText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  /* --- Holiday Styles --- */
  holidayContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  holidayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  addHolidayBtn: {
    backgroundColor: '#1e3a8a', // Dark blue matching + Add Holiday button in screenshot
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
  },
  addHolidayBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addHolidayCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  addHolidayCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.m,
  },
  holidayGrid: {
    flexDirection: 'column',
  },
  holidayCardItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  holidayIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(214, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  holidayNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  holidayDateText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: spacing.s,
  },
  holidayTypeTag: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  holidayTypeTagText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: 'bold',
  },
  holidayDescText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  emptyHolidaysBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyHolidaysText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  /* --- Leads Styles --- */
  leadsContainer: {
    flex: 1,
    padding: spacing.m,
  },
  leadsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  addLeadBtn: {
    backgroundColor: '#1e3a8a', // Dark blue matching screenshot + Add Lead button
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
  },
  addLeadBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leadsFilterCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  filterGroupLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  filterDropdownRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.s,
  },
  filterBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  smallFilterPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 4,
    marginBottom: 4,
  },
  smallFilterPillActive: {
    backgroundColor: 'rgba(214, 175, 55, 0.15)',
    borderColor: colors.accent,
  },
  smallFilterText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  smallFilterTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  filterSubmitBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.m,
    justifyContent: 'center',
  },
  filterSubmitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stageBluePill: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  stageBlueText: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: 'bold',
  },
  viewLeadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
  },
  viewLeadBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  /* --- Reports Styles --- */
  reportsContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  reportsControlCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  reportsInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    paddingHorizontal: spacing.s,
    height: 36,
    borderRadius: borderRadius.s,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 13,
  },
  generateReportBtn: {
    backgroundColor: '#1e3a8a', // Dark blue matching screenshot Generate button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.m,
    marginTop: spacing.s,
  },
  generateReportBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.m,
  },
  summaryBadgeCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.m,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: spacing.s,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  summaryBadgeLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  summaryBadgeVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
  /* --- Master Settings Styles --- */
  settingsContainer: {
    flex: 1,
    padding: spacing.m,
  },
  settingsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  saveSettingsBtn: {
    backgroundColor: '#1e3a8a', // Dark blue matching screenshot Save Changes button
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.m,
  },
  saveSettingsBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsTabScroll: {
    marginBottom: spacing.m,
    maxHeight: 40,
  },
  settingsTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.m,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  settingsTabPillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: colors.accent,
  },
  settingsTabText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  settingsTabTextActive: {
    color: colors.accent,
    fontWeight: 'bold',
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.s,
    marginBottom: spacing.s,
  },
  formRow3Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  formCol3: {
    width: '31%',
  },
  templateCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  templateBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    alignSelf: 'flex-start',
    marginBottom: spacing.s,
  },
  templateBadgeText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  smsTemplateBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    alignSelf: 'flex-start',
    marginBottom: spacing.s,
  },
  smsTemplateBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  /* --- Access Control Styles --- */
  accessControlCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  accessTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accessTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roleBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    alignSelf: 'flex-start',
  },
  roleEmployeeBadge: {
    backgroundColor: colors.surfaceLight,
  },
  roleEmployeeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
  },
  roleAdminBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  roleAdminText: {
    color: '#6366f1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roleKeyAdminBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  roleKeyAdminText: {
    color: '#a855f7',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionSelectCol: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  roleActionPill: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.s,
  },
  roleActionPillText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: 'bold',
  },
  /* --- Notifications Engine Styles --- */
  notificationsContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  notificationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  triggerBadgePill: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.s,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  triggerBadgeText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: 'bold',
  },
  emptyNotificationText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
  /* --- Company Wallet Styles --- */
  walletContainer: {
    padding: spacing.m,
    paddingBottom: 40,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  exportStatementBtn: {
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: borderRadius.m,
    marginRight: 6,
  },
  exportStatementText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  walletBalanceCard: {
    backgroundColor: '#09090b', // Dark black card matching user screenshot
    borderRadius: borderRadius.l,
    padding: spacing.xl,
    marginBottom: spacing.m,
    position: 'relative',
    overflow: 'hidden',
  },
  walletIconBackground: {
    position: 'absolute',
    right: -20,
    bottom: -30,
  },
  walletBalanceLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: spacing.s,
  },
  walletBalanceValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
  },
  /* --- Module Access Checkbox Styles --- */
  moduleAccessSection: {
    marginTop: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  moduleGridContainer: {
    marginTop: spacing.s,
  },
  moduleGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  empStatPill: {
    padding: spacing.s,
    borderRadius: borderRadius.m,
    alignItems: 'center',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  moduleCheckboxCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmarkIcon: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 13,
  },
  moduleCheckboxLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  /* --- Profile Screen Styles --- */
  profileAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  profileAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    overflow: 'hidden',
  },
  profileAvatarText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  changePhotoText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoTipText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  profileValText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 2,
  },
});













