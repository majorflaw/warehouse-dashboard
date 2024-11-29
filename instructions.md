// Page customization instructions

# 1. Main Page (1)
* Make that the main paige when a user loads the website it will give him a dark theme page, with a white text on the middle of the page saying "Welcome, please choose your department..." in a bold font.
* Two buttons under it:
    * "MS"
    * "CVG"
* Those button also should have a dark theme, rounded buttons, but not full rounded, just a little bit rounded.
* When user press on the "MS" or "CVG" button, it should go to another page, where the user has a different text saying "Please choose the flow..."
* Two other buttons under it:
    * "A FLOW"
    * "B FLOW"
* When user press on either of those buttons, it should go to another page, for now those new pages should be empty, we will work on them in the next steps.
* Create also a button for the second page, to go back to the main page.

# 2. A Flow Pages (2)
* Let's work now on the MS A Flow Page, so if the user presses on MS and then on A FLOW, it should get our Dashboard Page. Rename also the file something like "DashboardMSA.js" or something like that.
* Create also the same page for CVG A Flow Page, so if the user presses on CVG and then on A FLOW.
* For CVG A Flow Page instead of fetching from https://warehouse-data-server.onrender.com/api/testing/a_flow_shipment_data.json it should fetch from https://warehouse-data-server.onrender.com/api/testing_cvg/a_flow_shipment_data.json
* For now do not change anything in the Dashboard page, we will work on it in the next step.

# 3. A Flow Pages (3)
* From the dashboard page, remove the text that says "MS A Flow Dashboard" & "CVG A Flow Dashboard" and also the amount of shipments found.
* I want different columns in the table:
    * SHIPMENT NUMBER (which is already there, so that's good)
    * Remove Transport Way (we will work on it later)
    * Remove Priority (we will work on it later)
    * Remove Progress (we will work on it later)
    * Remove Status (we will work on it later)
    * END DATE -> which can be taken from shipment_end_date column. The value now is in DDMMYYYY format, you should convert it to DD.MM.YYYY format.
    * PROCESS -> which can be taken from process column.
    * QUANTITY -> which can be taken from total_quantity column.
    * FLOW -> which can be taken from flow column.

# 4. A Flow Pages (4)
* Add new columns:
    * HU -> We should have here Z/X, where Z is the value from total_hu_closed column and X is the value from total_hu column.
    * HU NESTED -> We should have here Z/X, where Z is the value from hu_nested column and X is the value from total_hu column.
    * TO PACKED -> We should have here Z/X, where Z is the value from tos_packed column and X is the value from total_lines column.

# 5. A Flow Pages (5)
* Add new columns:
    * LINES -> We should have here Z/X, where Z is the value from picked_lines column and X is the value from total_lines column.
    * We need to add to the COUNTRY column, also the flag of that country code, in the left of the country code. Make the flag be a circle, smaller than the text so it will not take too much space, but enough to be visible.