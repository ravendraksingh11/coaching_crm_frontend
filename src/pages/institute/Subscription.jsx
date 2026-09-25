import {
    useEffect,
    useState,
} from "react";


import {
    getPlans,
    // createPlan,
} from "../../api/superAdmin.api";

import {
    getMySubscription,
    purchaseSubscription,
} from "../../api/subscription.api";


export default function Subscription() {
    const [plans, setPlans] =
        useState([]);

    const [subscription, setSubscription] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    useEffect(() => {
        loadData();
    }, []);


    async function loadData() {
        // try {

        const plansResult =
            await getPlans();
        const subscriptionResult = await getMySubscription();
        console.log("subscriptionResult", subscriptionResult)
        setPlans(
            plansResult?.data || []
        );

        setSubscription(
            subscriptionResult?.data || []
        );

        // } catch (error) {
        //     console.error(error);
        // }
    }


    async function handlePurchase(planId) {

        const confirmed =
            window.confirm(
                "Do you want to purchase this plan?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setLoading(true);

            /*
             * Development version:
             * directly activates subscription.
             *
             * Production:
             * create Razorpay/Stripe order
             * and activate only after payment verification.
             */

            await purchaseSubscription(
                planId
            );

            alert(
                "Subscription activated successfully"
            );

            await loadData();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Purchase failed"
            );

        } finally {
            setLoading(false);
        }
    }

    const test = plans.filter((plan) => plan.is_active === true);
    console.log(plans, "test", test)
    return (
        <div>

            <h1>
                Subscription Plans
            </h1>


            {subscription && (
                <div>

                    <h3>
                        Current Subscription
                    </h3>

                    <p>
                        Plan:{" "}
                        {subscription.plan_name}
                    </p>

                    <p>
                        Status:{" "}
                        {subscription.status}
                    </p>

                    <p>
                        Start Date:{" "}
                        {subscription.start_date}
                    </p>

                    <p>
                        End Date:{" "}
                        {subscription.end_date}
                    </p>

                </div>
            )}


            <div className="plans">

                {plans
                    .filter(
                        (plan) =>
                            plan.is_active === true
                    )
                    .map((plan) => (

                        <div
                            key={plan.id}
                            className="plan-card"
                        >

                            <h2>
                                {plan.name}
                            </h2>

                            <h3>
                                ₹{plan.price}
                            </h3>

                            <p>
                                {plan.duration_months}
                                {" "}
                                month(s)
                            </p>

                            <p>
                                Students:
                                {" "}
                                {plan.max_students}
                            </p>

                            <p>
                                Teachers:
                                {" "}
                                {plan.max_teachers}
                            </p>

                            <p>
                                Batches:
                                {" "}
                                {plan.max_batches}
                            </p>


                            <button
                                onClick={() =>
                                    handlePurchase(
                                        plan.id
                                    )
                                }
                                disabled={loading}
                            >
                                Purchase Plan
                            </button>

                        </div>

                    ))}

            </div>

        </div>
    );
}