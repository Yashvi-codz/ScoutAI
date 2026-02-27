
import streamlit as st
import pandas as pd
import numpy as np
import joblib
from scipy import stats

# ----------------------------
# LOAD FILES
# ----------------------------

model = joblib.load("LR_scout_overall_model.pkl")
features = joblib.load("model_features.pkl")
dataset = pd.read_csv("Dataset - players_22.csv")

# ----------------------------
# FUNCTIONS
# ----------------------------

def assign_player_class(overall):

    if overall >= 90:
        return "Elite Pro"
    elif overall >= 75 and overall < 90:
        return "High Potential"
    elif overall >= 60 and overall < 75 :
        return "Developing"
    else:
        return "Grassroots"


def generate_swot(user_inputs):

    strengths = []
    weaknesses = []
    opportunities = []
    threats = []

    age = user_inputs["age"]

    for feature in features:

        if feature == "age":
            continue

        value = user_inputs[feature]
        percentile = stats.percentileofscore(dataset[feature], value)

        if percentile >= 80:
            strengths.append(feature)

        elif percentile <= 30:
            threats.append(feature)

        elif percentile <= 35:
            weaknesses.append(feature)

        elif 50 <= percentile < 80 and age < 26:
            opportunities.append(feature)

    return strengths, weaknesses, opportunities, threats


# ----------------------------
# UI
# ----------------------------

st.title("⚽ Football Performance Analyzer")
st.header("Enter Player Attributes")

user_input = {}

# Create two columns
col1, col2 = st.columns(2)

for i, feature in enumerate(features):

    # Alternate between columns
    column = col1 if i % 2 == 0 else col2

    with column:

        if feature == "age":
            user_input[feature] = st.slider(
                f"Select {feature}",
                min_value=16,
                max_value=45,
                value=25,
                step=1
            )

        elif feature == "height_cm":
            user_input[feature] = st.slider(
                f"Select {feature}",
                min_value=150,
                max_value=210,
                value=175,
                step=1
            )

        elif feature == "weight_kg":
            user_input[feature] = st.slider(
                f"Select {feature}",
                min_value=50,
                max_value=120,
                value=70,
                step=1
            )

        else:
            user_input[feature] = st.slider(
                f"Select {feature}",
                min_value=1,
                max_value=99,
                value=60,
                step=1
            )


if st.button("Predict Overall"):

    # IMPORTANT: Create DataFrame EXACTLY like training
    input_df = pd.DataFrame([user_input])

    # Reorder columns EXACTLY
    input_df = input_df[features]

    prediction = model.predict(input_df)[0]

    # Clamp output safely
    # prediction = max(80, min(95, prediction))

    st.success(f"Predicted Overall: {round(prediction,2)}")

    player_class = assign_player_class(prediction)

    strengths, weaknesses, opportunities, threats = generate_swot(user_input)

    st.subheader("Predicted Overall Rating")
    st.success(f"{prediction}")

    st.subheader("Player Class")
    st.info(player_class)

    st.subheader("SWOT Analysis")

    col1, col2 = st.columns(2)

    with col1:
        st.write("Strengths:", strengths)
        st.write("Opportunities:", opportunities)

    with col2:
        st.write("Weaknesses:", weaknesses)
        st.write("Threats:", threats)