sap.ui.require(
	[
		"sap/demo/bulletinboard/model/formatter"
	],
	function (formatter) {
		"use strict";
		QUnit.module("Date formatting unit tests");

		/* millisecondsAsDate(iMilliseconds) */

		QUnit.test("Should create a date object from current timestamp in milliseconds", function (assert) {
			var oNow = new Date();
			// Act
			var oDate = formatter.millisecondsAsDate(oNow.getTime());
			// Assert
			assert.equal(oDate.getTime(), oNow.getTime(), "The date was created correctly. It matches the reference date.");
		});

		QUnit.test("Should create a date object from timestamp in milliseconds: 8640000000000000", function (assert) {
			var iMaxTime = 8640000000000000
			// Act
			var oMaxDate = formatter.millisecondsAsDate(iMaxTime);
			// Assert
			assert.strictEqual(oMaxDate.getTime(), iMaxTime, "The date was created correctly. Timestamp matches the reference timestamp.");
		});

		QUnit.test("Should fail to create a date object from timestamp in milliseconds: 864000000000001", function (assert) {
			var iMaxTime = 8640000000000001
			// Act
			var oBadDate = formatter.millisecondsAsDate(iMaxTime);
			// Assert
			assert.notOk(oBadDate.getTime(), "The date was correctly created as an invalid date.");
		});

		/* millisecondsAsFormattedDate(iMilliseconds) */
		
		QUnit.test("Should create a date object from timestamp in milliseconds and format with medium style.", function (assert) {
			var oSomeDate = new Date(2017,3,22);
			var sSomeDate = "Apr 22, 2017";
			// Act
			var sDate = formatter.millisecondsAsFormattedDate(oSomeDate.getTime());
			// Assert
			assert.equal(sDate, sSomeDate, "The date was correctly created and formatted. Date string matches the reference date string: " + sSomeDate);
		});

		QUnit.test("Should create a date object from timestamp in milliseconds and format with medium style.", function (assert) {
			var oSomeDate = new Date(1958,0,6);
			var sSomeDate = "Jan 6, 1958";
			// Act
			var sDate = formatter.millisecondsAsFormattedDate(oSomeDate.getTime());
			// Assert
			assert.equal(sDate, sSomeDate, "The date was correctly created and formatted. Date string matches the reference date string: " + sSomeDate);
		});

		/* ISO 8601 date time */
		QUnit.test("Should create a datetime object from timestamp in milliseconds and format with medium style.", function (assert) {
			var oSomeTime = "2017-12-05T16:41:48.642+01:00";
			var sSomeTime = "Dec 5, 2017, 4:41:48 PM";
			// Act
			var sTime = formatter.iso8601AsFormattedDateTime(oSomeTime);
			// Assert
			assert.equal(sTime, sSomeTime, "The datetime was correctly created and formatted. Datetime string matches the reference datetime string: " + sSomeTime);
		});

		/* formatStatus */
		QUnit.test("Should resolve to Error on low rating", function (assert) {
			var oSomeRating = 1;
			// Act
			var infoState = formatter.formatStatus(oSomeRating);
			// Assert
			assert.equal(infoState, "Error", "The infoState was correctly parsed to Error");
		});

		QUnit.test("Should resolve to Warning on mediocre rating", function (assert) {
			var oSomeRating = 2;
			// Act
			var infoState = formatter.formatStatus(oSomeRating);
			// Assert
			assert.equal(infoState, "Warning", "The infoState was correctly parsed to Warning");
		});

		QUnit.test("Should resolve to Success on good rating", function (assert) {
			var oSomeRating = 4;
			// Act
			var infoState = formatter.formatStatus(oSomeRating);
			// Assert
			assert.equal(infoState, "Success", "The infoState was correctly parsed to Success");
		});

	}
);