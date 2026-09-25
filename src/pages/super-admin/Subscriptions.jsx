import React, { useEffect, useState } from "react";

import {
    getAllSubscriptions,
    activateSubscription,
} from "../../api/subscription.api";

import { getActivePlans } from "../../api/plans.api";

const Subscriptions = () => {

    const [subscriptions, setSubscriptions] = useState([]);
    const [plans, setPlans] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [selectedInstitute, setSelectedInstitute] =
        useState(null);

    const [form, setForm] = useState({
        planId: "",
        startDate: "",
    });


    // ========================================
    // LOAD DATA
    // ========================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                subscriptionResponse,
                planResponse,
            ] = await Promise.all([
                getAllSubscriptions(),
                getActivePlans(),
            ]);

            setSubscriptions(
                subscriptionResponse.data || []
            );

            setPlans(
                planResponse.data || []
            );

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load subscriptions"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadData();
    }, []);


    // ========================================
    // OPEN ACTIVATE MODAL
    // ========================================

    const openActivateModal = (subscription) => {

        setSelectedInstitute(subscription);

        setForm({
            planId: subscription.plan_id || "",
            startDate:
                subscription.start_date
                    ? subscription.start_date.substring(0, 10)
                    : new Date()
                        .toISOString()
                        .split("T")[0],
        });

        setShowModal(true);
    };


    // ========================================
    // ACTIVATE PLAN
    // ========================================

    const handleActivate = async (e) => {

        e.preventDefault();

        if (!selectedInstitute) {
            return;
        }

        if (!form.planId) {
            alert("Please select a plan");
            return;
        }

        try {

            setSaving(true);

            await activateSubscription({

                instituteId:
                    selectedInstitute.institute_id,

                planId:
                    form.planId,

                startDate:
                    form.startDate,
            });

            alert(
                "Subscription activated successfully"
            );

            setShowModal(false);

            setSelectedInstitute(null);

            await loadData();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to activate subscription"
            );

        } finally {

            setSaving(false);

        }
    };


    // ========================================
    // UI
    // ========================================

    if (loading) {
        return (
            <div style={styles.center}>
                Loading subscriptions...
            </div>
        );
    }


    return (
        <div style={styles.container}>

            <div style={styles.header}>

                <div>
                    <h1 style={styles.title}>
                        Subscriptions
                    </h1>

                    <p style={styles.subtitle}>
                        Manage institute subscription plans
                    </p>
                </div>

                <button
                    onClick={loadData}
                    style={styles.refreshButton}
                >
                    Refresh
                </button>

            </div>


            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}


            {/* ========================================
                TABLE
            ======================================== */}

            <div style={styles.card}>

                <div style={styles.tableWrapper}>

                    <table style={styles.table}>

                        <thead>
                            <tr>

                                <th style={styles.th}>
                                    Institute
                                </th>

                                <th style={styles.th}>
                                    Plan
                                </th>

                                <th style={styles.th}>
                                    Price
                                </th>

                                <th style={styles.th}>
                                    Start Date
                                </th>

                                <th style={styles.th}>
                                    End Date
                                </th>

                                <th style={styles.th}>
                                    Status
                                </th>

                                <th style={styles.th}>
                                    Payment
                                </th>

                                <th style={styles.th}>
                                    Action
                                </th>

                            </tr>
                        </thead>


                        <tbody>

                            {subscriptions.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="8"
                                        style={styles.empty}
                                    >
                                        No subscriptions found
                                    </td>
                                </tr>

                            ) : (

                                subscriptions.map(
                                    (subscription) => (

                                        <tr
                                            key={
                                                subscription.id
                                            }
                                        >

                                            <td style={styles.td}>
                                                <strong>
                                                    {
                                                        subscription.institute_name
                                                    }
                                                </strong>
                                            </td>

                                            <td style={styles.td}>
                                                {
                                                    subscription.plan_name
                                                }
                                            </td>

                                            <td style={styles.td}>
                                                ₹
                                                {
                                                    subscription.amount
                                                }
                                            </td>

                                            <td style={styles.td}>
                                                {
                                                    subscription.start_date
                                                        ? new Date(
                                                            subscription.start_date
                                                        ).toLocaleDateString()
                                                        : "-"
                                                }
                                            </td>

                                            <td style={styles.td}>
                                                {
                                                    subscription.end_date
                                                        ? new Date(
                                                            subscription.end_date
                                                        ).toLocaleDateString()
                                                        : "-"
                                                }
                                            </td>

                                            <td style={styles.td}>

                                                <span
                                                    style={
                                                        subscription.status ===
                                                            "ACTIVE"
                                                            ? styles.active
                                                            : styles.cancelled
                                                    }
                                                >
                                                    {
                                                        subscription.status
                                                    }
                                                </span>

                                            </td>

                                            <td style={styles.td}>

                                                <span
                                                    style={
                                                        subscription.payment_status ===
                                                            "PAID"
                                                            ? styles.active
                                                            : styles.pending
                                                    }
                                                >
                                                    {
                                                        subscription.payment_status
                                                    }
                                                </span>

                                            </td>

                                            <td style={styles.td}>

                                                <button
                                                    onClick={() =>
                                                        openActivateModal(
                                                            subscription
                                                        )
                                                    }
                                                    style={
                                                        styles.activateButton
                                                    }
                                                >
                                                    Change Plan
                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ========================================
                MODAL
            ======================================== */}

            {showModal && (

                <div style={styles.overlay}>

                    <div style={styles.modal}>

                        <div style={styles.modalHeader}>

                            <h2>
                                Activate Subscription
                            </h2>

                            <button
                                onClick={() =>
                                    setShowModal(false)
                                }
                                style={styles.close}
                            >
                                ×
                            </button>

                        </div>


                        <div style={styles.instituteBox}>

                            <strong>
                                Institute
                            </strong>

                            <div>
                                {
                                    selectedInstitute?.institute_name
                                }
                            </div>

                        </div>


                        <form
                            onSubmit={
                                handleActivate
                            }
                        >

                            <div style={styles.formGroup}>

                                <label>
                                    Select Plan
                                </label>

                                <select
                                    value={
                                        form.planId
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            planId:
                                                e.target.value,
                                        })
                                    }
                                    style={styles.input}
                                    required
                                >

                                    <option value="">
                                        Select plan
                                    </option>

                                    {plans.map(
                                        (plan) => (

                                            <option
                                                key={
                                                    plan.id
                                                }
                                                value={
                                                    plan.id
                                                }
                                            >
                                                {
                                                    plan.name
                                                }
                                                {" - ₹"}
                                                {
                                                    plan.price
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div style={styles.formGroup}>

                                <label>
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        form.startDate
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            startDate:
                                                e.target.value,
                                        })
                                    }
                                    style={styles.input}
                                />

                            </div>


                            <div style={styles.modalActions}>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                    style={
                                        styles.cancelButton
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={
                                        styles.saveButton
                                    }
                                >
                                    {saving
                                        ? "Activating..."
                                        : "Activate Plan"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


// ========================================
// STYLES
// ========================================

const styles = {

    container: {
        padding: "30px",
        background: "#f5f7fb",
        minHeight: "100vh",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
    },

    title: {
        margin: 0,
        fontSize: "28px",
    },

    subtitle: {
        marginTop: "5px",
        color: "#666",
    },

    refreshButton: {
        padding: "10px 18px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },

    card: {
        background: "#fff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow:
            "0 2px 10px rgba(0,0,0,0.05)",
    },

    tableWrapper: {
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },

    th: {
        textAlign: "left",
        padding: "14px",
        borderBottom: "1px solid #ddd",
        background: "#f8f9fa",
    },

    td: {
        padding: "14px",
        borderBottom: "1px solid #eee",
    },

    active: {
        background: "#dcfce7",
        color: "#166534",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
    },

    cancelled: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
    },

    pending: {
        background: "#fef3c7",
        color: "#92400e",
        padding: "5px 10px",
        borderRadius: "20px",
        fontSize: "12px",
    },

    activateButton: {
        border: "none",
        background: "#2563eb",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "6px",
        cursor: "pointer",
    },

    empty: {
        textAlign: "center",
        padding: "40px",
        color: "#777",
    },

    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "12px",
        borderRadius: "6px",
        marginBottom: "15px",
    },

    center: {
        padding: "50px",
        textAlign: "center",
    },

    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },

    modal: {
        width: "450px",
        maxWidth: "90%",
        background: "#fff",
        borderRadius: "10px",
        padding: "25px",
    },

    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },

    close: {
        border: "none",
        background: "none",
        fontSize: "25px",
        cursor: "pointer",
    },

    instituteBox: {
        background: "#f5f7fb",
        padding: "15px",
        borderRadius: "6px",
        marginBottom: "20px",
    },

    formGroup: {
        marginBottom: "18px",
    },

    input: {
        width: "100%",
        padding: "11px",
        marginTop: "7px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        boxSizing: "border-box",
    },

    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "25px",
    },

    cancelButton: {
        padding: "10px 18px",
        border: "1px solid #ddd",
        background: "#fff",
        borderRadius: "6px",
        cursor: "pointer",
    },

    saveButton: {
        padding: "10px 18px",
        border: "none",
        background: "#2563eb",
        color: "#fff",
        borderRadius: "6px",
        cursor: "pointer",
    },
};

export default Subscriptions;