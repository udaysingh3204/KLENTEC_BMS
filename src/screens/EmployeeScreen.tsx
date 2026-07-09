import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme';
import { AttendanceStatus } from '../types';
import { formatCurrency, parseWholeNumberInput } from '../utils/finance';

type Props = NativeStackScreenProps<RootStackParamList, 'Employees'>;

const ROLES = ['Driver', 'Loader', 'Salesperson', 'Cashier', 'Supervisor', 'Helper'];

const attendanceColors: Record<AttendanceStatus, { bg: string; text: string; border: string }> = {
  Present: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
  'Half Day': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  Absent: { bg: '#FEE2E2', text: '#991B1B', border: '#F87171' },
};

const todayStr = () => new Date().toISOString().split('T')[0];

export function EmployeeScreen({ navigation }: Props) {
  const addEmployee = useAppStore((s) => s.addEmployee);
  const deleteEmployee = useAppStore((s) => s.deleteEmployee);
  const editEmployee = useAppStore((s) => s.editEmployee);
  const attendance = useAppStore((s) => s.attendance);
  const employees = useAppStore((s) => s.employees);
  const markAttendance = useAppStore((s) => s.markAttendance);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Driver');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('Driver');
  const [editSalary, setEditSalary] = useState('');
  const [editError, setEditError] = useState('');

  const today = todayStr();
  const todayAttendance = useMemo(
    () => attendance.filter((a) => a.date === today),
    [attendance, today]
  );
  const activeEmployees = employees.filter((e) => e.status === 'Active');

  const presentCount = todayAttendance.filter((a) => a.status === 'Present').length;
  const halfDayCount = todayAttendance.filter((a) => a.status === 'Half Day').length;
  const absentCount = todayAttendance.filter((a) => a.status === 'Absent').length;
  const unmarkedCount = activeEmployees.length - todayAttendance.length;

  const monthlyPayroll = activeEmployees.reduce((sum, e) => sum + e.salary, 0);

  const getEmployeeAttendance = (employeeId: string): AttendanceStatus | null =>
    todayAttendance.find((a) => a.employeeId === employeeId)?.status ?? null;

  const handleAddEmployee = () => {
    const parsedSalary = parseWholeNumberInput(salary);
    if (!parsedSalary) {
      setError('Salary must be a positive whole number.');
      return;
    }
    const result = addEmployee({ name, phone, role, salary: parsedSalary });
    if (!result.success) {
      setError(result.message ?? 'Unable to save employee.');
      return;
    }
    setName('');
    setPhone('');
    setRole('Driver');
    setSalary('');
    setError('');
  };

  const handleEditEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    setEditingId(id);
    setEditName(emp.name);
    setEditPhone(emp.phone);
    setEditRole(emp.role);
    setEditSalary(String(emp.salary));
    setEditError('');
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const parsedSalary = parseWholeNumberInput(editSalary);
    if (!parsedSalary) {
      setEditError('Salary must be a positive whole number.');
      return;
    }
    const result = editEmployee(editingId, { name: editName, phone: editPhone, role: editRole, salary: parsedSalary });
    if (!result.success) {
      setEditError(result.message ?? 'Unable to save.');
      return;
    }
    setEditingId(null);
  };

  const handleDeleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    Alert.alert('Delete Employee', `Remove ${emp.name} from the system?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const result = deleteEmployee(id);
          if (!result.success) {
            Alert.alert('Error', result.message ?? 'Unable to delete.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenShell
      title="Employees"
      subtitle="Manage staff, mark daily attendance, and track monthly payroll."
      action={
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      }
    >
      {/* Summary row */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: '#10B981', backgroundColor: '#F0FDF4' }]}>
          <Text style={styles.summaryLabel}>Present</Text>
          <Text style={[styles.summaryValue, { color: '#065F46' }]}>{presentCount}</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' }]}>
          <Text style={styles.summaryLabel}>Half Day</Text>
          <Text style={[styles.summaryValue, { color: '#92400E' }]}>{halfDayCount}</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#F87171', backgroundColor: '#FFF5F5' }]}>
          <Text style={styles.summaryLabel}>Absent</Text>
          <Text style={[styles.summaryValue, { color: '#991B1B' }]}>{absentCount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Unmarked</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.muted }]}>{unmarkedCount}</Text>
        </View>
      </View>

      {/* Today's attendance */}
      <SectionCard
        title="Today's Attendance"
        description={`Mark attendance for ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`}
      >
        {activeEmployees.map((employee) => {
          const currentStatus = getEmployeeAttendance(employee.id);

          return (
            <View key={employee.id} style={styles.attendanceRow}>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>{employee.name}</Text>
                <Text style={styles.employeeRole}>{employee.role}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attendanceBtns}>
                {(['Present', 'Half Day', 'Absent'] as AttendanceStatus[]).map((status) => {
                  const c = attendanceColors[status];
                  const isSelected = currentStatus === status;
                  return (
                    <Pressable
                      key={status}
                      onPress={() => markAttendance(employee.id, status)}
                      style={[
                        styles.attendanceBtn,
                        { borderColor: c.border },
                        isSelected ? { backgroundColor: c.bg } : { backgroundColor: theme.colors.panelRaised },
                      ]}
                    >
                      <Text style={[styles.attendanceBtnText, { color: isSelected ? c.text : theme.colors.muted }]}>
                        {status === 'Half Day' ? '½ Day' : status}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })}
        {activeEmployees.length === 0 ? (
          <Text style={styles.emptyText}>No active employees. Add employees below.</Text>
        ) : null}
      </SectionCard>

      {/* Payroll snapshot */}
      <SectionCard title="Payroll Snapshot" description="Monthly salary totals across active staff.">
        <View style={styles.payrollRow}>
          <Text style={styles.payrollLabel}>Active employees</Text>
          <Text style={styles.payrollValue}>{activeEmployees.length}</Text>
        </View>
        <View style={styles.payrollRow}>
          <Text style={styles.payrollLabel}>Monthly payroll</Text>
          <Text style={[styles.payrollValue, { color: theme.colors.primary }]}>{formatCurrency(monthlyPayroll)}</Text>
        </View>
      </SectionCard>

      {/* Add employee */}
      <SectionCard title="Add Employee" description="Capture details to register a new staff member.">
        <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={theme.colors.muted} style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="Mobile number" placeholderTextColor={theme.colors.muted} keyboardType="phone-pad" style={styles.input} />
        <TextInput value={salary} onChangeText={setSalary} placeholder="Monthly salary (₹)" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />

        <Text style={styles.groupLabel}>Role</Text>
        <View style={styles.chipWrap}>
          {ROLES.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[styles.chip, role === r ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, role === r ? styles.chipTextActive : null]}>{r}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={handleAddEmployee} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add Employee</Text>
        </Pressable>
      </SectionCard>

      {/* Employee directory */}
      <SectionCard title="Employee Directory" description="All registered staff with role and salary details.">
        {employees.map((employee) => (
          <View key={employee.id} style={styles.directoryRow}>
            <View style={styles.directoryAvatar}>
              <Text style={styles.directoryAvatarText}>{employee.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.directoryCopy}>
              <Text style={styles.directoryName}>{employee.name}</Text>
              <Text style={styles.directoryMeta}>{employee.role} · {employee.phone}</Text>
              <Text style={styles.directorySalary}>{formatCurrency(employee.salary)} / month</Text>
            </View>
            <View style={styles.directoryActions}>
              <Pressable onPress={() => handleEditEmployee(employee.id)} style={styles.editButton}>
                <Text style={styles.editButtonText}>✏️</Text>
              </Pressable>
              <Pressable onPress={() => handleDeleteEmployee(employee.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {employees.length === 0 ? (
          <Text style={styles.emptyText}>No employees added yet.</Text>
        ) : null}
      </SectionCard>

      {/* Edit modal */}
      {editingId && (
        <SectionCard title="Edit Employee" description="Update employee details">
          <TextInput value={editName} onChangeText={setEditName} placeholder="Full name" placeholderTextColor={theme.colors.muted} style={styles.input} />
          <TextInput value={editPhone} onChangeText={setEditPhone} placeholder="Mobile number" placeholderTextColor={theme.colors.muted} keyboardType="phone-pad" style={styles.input} />
          <TextInput value={editSalary} onChangeText={setEditSalary} placeholder="Monthly salary (₹)" placeholderTextColor={theme.colors.muted} keyboardType="numeric" style={styles.input} />
          <Text style={styles.groupLabel}>Role</Text>
          <View style={styles.chipWrap}>
            {ROLES.map((r) => (
              <Pressable
                key={r}
                onPress={() => setEditRole(r)}
                style={[styles.chip, editRole === r ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, editRole === r ? styles.chipTextActive : null]}>{r}</Text>
              </Pressable>
            ))}
          </View>
          {editError ? <Text style={styles.error}>{editError}</Text> : null}
          <View style={styles.buttonRow}>
            <Pressable onPress={() => setEditingId(null)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSaveEdit} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </Pressable>
          </View>
        </SectionCard>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: theme.colors.panelRaised,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backButtonText: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.panel,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    gap: 2,
  },
  summaryLabel: { color: theme.colors.muted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 10,
  },
  employeeInfo: { flex: 1 },
  employeeName: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  employeeRole: { color: theme.colors.muted, fontSize: 12, marginTop: 2 },
  attendanceBtns: { flexDirection: 'row', gap: 6 },
  attendanceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  attendanceBtnText: { fontSize: 12, fontWeight: '700' },
  payrollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  payrollLabel: { color: theme.colors.muted, fontSize: 14, fontWeight: '500' },
  payrollValue: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  input: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  groupLabel: {
    marginTop: 14,
    marginBottom: 8,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.panelRaised,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  chipText: { color: theme.colors.muted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: theme.colors.primary },
  error: { marginTop: 10, color: theme.colors.negative, fontSize: 13, fontWeight: '600' },
  primaryButton: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  directoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  directoryAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directoryAvatarText: { color: theme.colors.primary, fontSize: 18, fontWeight: '800' },
  directoryCopy: { flex: 1 },
  directoryName: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  directoryMeta: { color: theme.colors.muted, fontSize: 13, marginTop: 2 },
  directorySalary: { color: theme.colors.primary, fontSize: 13, fontWeight: '600', marginTop: 2 },
  directoryActions: { flexDirection: 'row', gap: 8 },
  editButton: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: theme.colors.panelRaised, borderWidth: 1, borderColor: theme.colors.border },
  editButtonText: { fontSize: 14 },
  deleteButton: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: '#F87171' },
  deleteButtonText: { fontSize: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  statusActive: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  statusInactive: { backgroundColor: '#FEE2E2', borderColor: '#F87171' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextActive: { color: '#065F46' },
  statusTextInactive: { color: '#991B1B' },
  emptyText: { color: theme.colors.muted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryButton: { flex: 1, borderRadius: 12, backgroundColor: theme.colors.panelRaised, borderWidth: 1.5, borderColor: theme.colors.border, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
});
